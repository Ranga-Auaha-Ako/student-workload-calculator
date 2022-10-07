import { writable as localStorageStore } from 'svelte-local-storage-store';
import { Course } from '$lib/course';
import { get, writable, type Writable } from 'svelte/store';
import { PrimaryMeeting } from '$lib/course-activities/primaryMeeting';
import { goto } from '$app/navigation';

const storeVersion = 'v2';

const serializer = {
	stringify(value: Course[]) {
		const serialized = value.map((c) => Course.serialize(c));
		return JSON.stringify(serialized);
	},
	parse(value: string) {
		const parsed: object[] = JSON.parse(value);
		const courseList: Course[] = [];
		parsed.forEach((c: any) => {
			const course = Course.deserialize(c);
			if (course) {
				course.subscribe(notifyStore);
				courseList.push(course);
			}
		});
		console.log(parsed);
		return courseList;
	}
};

const notifyStore = () => {
	courses.update((c) => c);
};

export const courses: Writable<Course[]> = localStorageStore(`${storeVersion}-courses`, [], {
	serializer
});
export const activeCourse: Writable<number> = localStorageStore(`${storeVersion}-activeCourse`, -1);
// export const courses: Writable<Course[]> = writable([]);
// export const activeCourse: Writable<number> = writable(0);

export const addCourse = (course = new Course('Your Course', 12)) => {
	console.log('Adding Course!');
	course.subscribe(notifyStore);
	courses.update((c) => [...c, course]);
	activeCourse.set(get(courses).length - 1);
	// goto('/');
};

export const deleteCourse = (i: number) => {
	courses.update((c) => {
		c.splice(i, 1);
		return c;
	});
	activeCourse.set(-1);
};

export const openCourse = (i: number) => {
	activeCourse.set(i);
	goto('/');
};

export const exportCourseData = () => {
	const courseData = get(courses).map((c) => Course.serialize(c));
	const json = JSON.stringify(courseData, null, 2);
	const blob = new Blob([json], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = 'activities.json';
	link.click();
};

export const importCourseData = (data: string) => {
	try {
		const courseData = JSON.parse(data);
		courseData.forEach((c: any) => {
			const course = Course.deserialize(c);
			if (course) {
				course.subscribe(notifyStore);
				courses.update((c) => [...c, course]);
			}
		});
	} catch (error) {
		console.error(error);
	}
};
