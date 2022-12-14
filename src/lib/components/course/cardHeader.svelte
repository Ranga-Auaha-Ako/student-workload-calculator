<script lang="ts">
	import ChevronDown from 'svelte-material-icons/ChevronDown.svelte';
	import RangeInput from '$lib/components/form-elems/rangeInput.svelte';
	import { Course, getCourseData, type courseData, type courseDataValid } from '$lib/course';
	import { propertyStore } from 'svelte-writable-derived';
	import { cardState } from './card';
	import autoAnimate from '$lib/autoAnimate';

	export let course: Course;
	export let state: cardState;

	$: meta = course?.meta;
	$: activities = course?.activities;
	$: totals = $activities && Course.getTotal($activities);

	$: writableWeeks = propertyStore(meta, ['weeks']);
	$: writableTarget = propertyStore(meta, ['target']);
	$: writableTargetFreq = propertyStore(meta, ['targetFreq']);
	$: writableWeekTemplate = propertyStore(meta, ['weekTemplate']);

	const toggleState = (e: MouseEvent) => {
		if (state === cardState.editExpanded) {
			state = cardState.edit;
		} else if (state === cardState.edit) {
			state = cardState.editExpanded;
		}
		e.stopPropagation();
		return false;
	};
</script>

{#if state === cardState.view}
	<div class="header-text">
		<h3 class="uni-header">{$meta.name}</h3>
	</div>
{:else}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		class="header-block"
		class:cursor-pointer={state === cardState.edit}
		use:autoAnimate
		on:click={(e) => {
			if (state === cardState.edit) toggleState(e);
		}}
	>
		{#if state === cardState.editExpanded || state === cardState.create}
			<label class="coursename" for="courseEdit-{course.id}-courseName">
				<span class="prefix">Course:</span>
				<input
					type="text"
					bind:value={$meta.name}
					id="courseEdit-{course.id}-courseName"
					placeholder="Title"
				/>
				<!-- <span class="suffix">✐</span> -->
			</label>
		{:else}
			<h3 class="title">{$meta.name}</h3>
		{/if}
		{#if state !== cardState.create}
			<button
				class="header-toggle"
				class:expanded={state === cardState.editExpanded}
				on:click={(e) => {
					toggleState(e);
				}}
				title={state === cardState.editExpanded ? 'Collapse' : 'Expand'}
			>
				<ChevronDown />
			</button>
		{/if}
	</div>
{/if}

<style lang="postcss">
	.header-text {
		padding: 0 var(--card-padding);
		@apply pt-4;
		.uni-header {
			@apply text-2xl font-semibold font-display italic;
			&:after {
				@apply w-3/5;
			}
		}
	}
	.header-block {
		@apply bg-uni-blue w-full text-white text-left font-bold flex items-center gap-3 z-30 relative;
		padding: 0 var(--card-padding);
		@apply py-4;
		.title {
			@apply w-full m-0 text-2xl font-semibold font-display italic;
		}
		.coursename {
			@apply text-2xl font-semibold font-display italic flex items-center gap-2 border-b-2 border-gray-200;
			.prefix {
				@apply block opacity-50;
			}
			input {
				@apply flex-grow border-0 p-0 px-2 text-2xl bg-white bg-opacity-0 text-white placeholder-white placeholder-opacity-50 w-full rounded focus:ring-0 transition focus:bg-opacity-10 focus:placeholder-transparent;
			}
		}
		.header-toggle {
			@apply text-3xl transition transform;
			&.expanded {
				@apply rotate-180;
			}
		}
	}
</style>
