<script lang="ts">
	import type { Readable } from 'svelte/store';
	import { fade } from 'svelte/transition';
	import { Frequency, type Activity } from '$lib/course-activities/genericActivity';
	import RangeInput from '$lib/components/form-elems/rangeInput.svelte';
	import type { Course } from '$lib/course';
	import { durationToString } from '$lib/serialize';
	import { getActivityClass } from '$lib/activities';

	export let course: Course;
	$: openActivity = course.openActivity;
	$: activities = course.activities;
	$: activity = $activities && $openActivity !== undefined ? $activities[$openActivity] : undefined;
	$: instanceName = activity?.instanceName;

	$: results = activity ? activity.results : undefined;
	$: freq = activity ? activity.freq : undefined;

	$: resultsList = $results
		? [
				{
					value: $results.prepHoursPer,
					formatted: durationToString($results.prepHoursPer, $results.occurences),
					label: ' to prepare'
				},
				{
					value: $results.IndependentHoursPer,
					formatted: durationToString($results.IndependentHoursPer, $results.occurences),
					label: 'of independent study'
				},
				{
					value: $results.scheduledHoursPer,
					formatted: durationToString($results.scheduledHoursPer, $results.occurences),
					label: 'of additional scheduled class time'
				},
				{
					value: $results.postActivityHoursPer,
					formatted: durationToString($results.postActivityHoursPer, $results.occurences),
					label: 'of time post activity'
				}
		  ]
		: [];
	$: filteredList = resultsList.filter((item) => item.value > 0);
</script>

{#if activity}
	<div>
		{#key $openActivity}
			<h2 class="text-xl activityTitle">
				<span class="icon" style={`color:${getActivityClass(activity).hexColour}`}>
					<svelte:component this={getActivityClass(activity).icon} />
				</span>
				{getActivityClass(activity).label}: {$instanceName}
			</h2>
			<div>
				{#each activity.form as formElem}
					<svelte:component this={formElem && formElem.activity} props={formElem.props} />
				{/each}
			</div>
			<div class="mt-2">
				<RangeInput
					props={{
						id: 'grade Worth',
						value: activity.gradeWorth,
						label: 'Grade Worth (%)',
						min: 0,
						max: 100,
						step: 1
					}}
				/>
			</div>
			{#if $results && filteredList.length > 0}
				<div class="results mt-4">
					<h2 class="text-xl">Results</h2>
					<p>
						{#if $freq == Frequency.Weekly}
							Each week, this activity takes:
						{:else}
							This activity will take:
						{/if}
					</p>
					<ul
						class="list-disc 
					Class
					Properties
					list-inside"
					>
						{#each filteredList as item}
							<li><strong>{item.formatted}</strong> {item.label}</li>
						{/each}
					</ul>
				</div>
			{/if}
		{/key}
	</div>
{/if}

<style lang="postcss">
	.activityTitle {
		@apply flex items-center gap-2;
		.icon {
			@apply inline-block h-full;
		}
	}
</style>
