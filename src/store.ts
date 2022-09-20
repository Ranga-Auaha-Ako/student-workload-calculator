import { writable as localStorageStore } from 'svelte-local-storage-store';
import { Course } from '$lib/course';
import { get, writable, type Writable } from 'svelte/store';
import { PrimaryMeeting } from '$lib/components';

const serializer = {
	stringify(value: Course[]) {
		const serialized = value.map((c) => Course.serialize(c));
		console.log(serialized);
		return JSON.stringify(serialized);
	},
	parse(value: string) {
		const parsed: object[] = JSON.parse(value);
		const courseList: Course[] = [];
		parsed.forEach((c: any) => {
			const course = Course.deserialize(c);
			course.subscribe(notifyStore);
			courseList.push(course);
		});
		console.log(parsed);
		return courseList;
	}
};

const notifyStore = () => {
	courses.update((c) => c);
};

export const courses: Writable<Course[]> = localStorageStore('courses', [], { serializer });
export const activeCourse: Writable<number> = localStorageStore('activeCourse', -1);
// export const courses: Writable<Course[]> = writable([]);
// export const activeCourse: Writable<number> = writable(0);

export const addCourse = (course = new Course('Your Course', 12)) => {
	console.log('Adding Course!');
	course.subscribe(notifyStore);
	courses.update((c) => [...c, course]);
	activeCourse.set(get(courses).length - 1);
};
