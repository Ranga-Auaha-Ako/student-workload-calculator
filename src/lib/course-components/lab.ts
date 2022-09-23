import { get, derived, writable, type Readable, type Writable } from 'svelte/store';
import type { courseMeta } from '../course';
import { RangeInput, TextInput, CheckSelectInput, CheckboxInput } from '../form';
import { Component, Frequency } from '$lib/course-components/genericComponent';
import type { serializedComponent, calculatedResults, derivedCalculated } from '../components';

export class Lab extends Component {
	static readonly writables = [
		'instanceName',
		'labsPerWeek',
		'labLength',
		'prepTime',
		'isScheduled',
		'postLab',
		'weeksRunning'
	];
	static type = 'Lab';
	static label = 'Lab';
	static icon = '🥼';
	static description =
		'This component is focused on the Laboratory portion of courses. Labs can have scheduled and independent activities. When the scheduled box is checked (the default state), the hours per lab portion is added to scheduled hours; preparation and post-lab inputs are added to independent hours. If the check is removed, all hours are assigned to the independent category and reflected in workload summary accordingly.';
	static freq = Frequency.Weekly;
	instanceName = writable('Lab');
	labsPerWeek = writable(1);
	labLength = writable(1);
	prepTime = writable(30);
	isScheduled = writable(false);
	postLab = writable(30);
	weeksRunning: Writable<string[]>;
	readonly weeksList: Readable<string[]>;
	readonly results: Readable<calculatedResults>;
	form;
	derivedCalculated: Readable<derivedCalculated>;

	constructor(courseMeta: Writable<courseMeta>) {
		super(courseMeta);
		this.weeksList = derived(courseMeta, ($courseMeta) =>
			[...Array($courseMeta.weeks).keys()].map((e) => (e + 1).toString())
		);
		this.weeksRunning = writable(get(this.weeksList));
		this.form = [
			new TextInput('componentName', this.instanceName, 'Component Name'),
			new RangeInput('labsPerWeek', this.labsPerWeek, 'Labs per week', {
				min: 0,
				max: 14
			}),
			new RangeInput('labLength', this.labLength, 'Lab Duration (Hours)', {
				min: 0,
				max: 12
			}),
			new RangeInput('prepTime', this.prepTime, 'Preparation Time (Minutes)', {
				min: 0,
				max: 120,
				step: 5
			}),
			new RangeInput('postLab', this.postLab, 'Post-Lab Time (Minutes)', {
				min: 0,
				max: 120,
				step: 5
			}),
			new CheckboxInput('isScheduled', this.isScheduled, 'Lab is scheduled'),
			new CheckSelectInput('weeksRunning', this.weeksRunning, 'Weeks class runs', {
				options: this.weeksList
			})
		];
		this.results = derived(
			[
				this.labsPerWeek,
				this.labLength,
				this.prepTime,
				this.postLab,
				this.isScheduled,
				this.weeksRunning,
				this.weeksList
			],
			([
				$labsPerWeek,
				$labLength,
				$prepTime,
				$postLab,
				$isScheduled,
				$weeksRunning,
				$weeksList
			]) => {
				return {
					occurences: $labsPerWeek,
					prepHoursPer: $prepTime / 60,
					independantHoursPer: $isScheduled ? 0 : $labLength,
					scheduledHoursPer: $isScheduled ? $labLength : 0,
					postActivityHoursPer: $postLab / 60,
					weeksRunning: $weeksList.map((w) => $weeksRunning?.includes(w) || false)
				};
			}
		);
		this.derivedCalculated = this.setDerived(courseMeta);
		this.watchDerived();
	}
}