import { derived, writable, type Readable, type Writable, readable } from 'svelte/store';
import type { courseMeta } from '../course';
import * as form from '../form';
import { Component, Frequency } from '$lib/course-components/genericComponent';
import type { calculatedResults, derivedCalculated } from '../components';

enum format {
	Independant = 0,
	Scheduled = 1
}

export class Quiz extends Component {
	static readonly writables = ['instanceName', 'format', 'perSem', 'prepLength', 'QuizLength'];
	static type = 'Quiz';
	static label = 'Quiz';
	static icon = '⁉️';
	static description =
		'This component is focused on quizzes, which can be either be held in an asynchronous (typically online) or synchronous (within a Primary Class Meeting) manner.';
	static freq = Frequency.Semester;
	instanceName = writable('Quiz');
	format: Writable<format> = writable(format.Independant);
	perSem = writable(1);
	prepLength = writable(0);
	QuizLength = writable(30);

	readonly results: Readable<calculatedResults>;
	form;
	derivedCalculated: Readable<derivedCalculated>;
	constructor(courseMeta: Writable<courseMeta>) {
		super(courseMeta);
		this.form = [
			new form.TextInput('componentName', this.instanceName, 'Quiz Name'),
			new form.SingleSelectInput('format', this.format, 'Quiz Format', {
				options: readable(['Independant', 'Scheduled'])
			}),
			new form.RangeInput('perSem', this.perSem, 'Quizzes Per Course', {
				min: 0,
				max: 10
			}),
			new form.RangeInput('prepLength', this.prepLength, 'Study Hours per Quiz', {
				min: 0,
				max: 100
			}),
			new form.ConditionalInput(
				'isIndependant',
				derived(this.format, ($f) => $f === format.Independant),
				'',
				{
					elements: [
						new form.RangeInput('QuizLength', this.QuizLength, 'Quiz Duration (Minutes)', {
							min: 0,
							max: 300,
							step: 15
						})
					]
				}
			)
		];
		this.results = derived(
			[this.format, this.perSem, this.prepLength, this.QuizLength],
			([$format, $perSem, $prepLength, $QuizLength]) => {
				return {
					occurences: $perSem,
					prepHoursPer: $prepLength,
					independantHoursPer: $format === format.Independant ? $QuizLength / 60 : 0,
					scheduledHoursPer: 0,
					postActivityHoursPer: 0
				};
			}
		);
		this.derivedCalculated = this.setDerived(courseMeta);
		this.watchDerived();
	}
}