import axios from 'axios';
import * as FormData from 'form-data';
import { ClientRequest } from 'http';

main().catch(console.error);

async function main() {
	const NW = [44.85167061339378, -0.5671098076715935];
	const SE = [44.83706864026471, -0.5441770324348592];

	const n = 2;
	const latStep = (SE[0] - NW[0]) / n;
	const longStep = (SE[1] - NW[1]) / n;

	let csv = 'latitude;longitude\n';
	for (let lat = NW[0]; lat > SE[0]; lat += latStep) {
		for (let long = NW[1]; long < SE[1]; long += longStep) {
			csv += `${lat};${long}\n`
		}
	}

	csv = 'latitude;longitude\n' +
		'44.827718;-0.597937\n' +
		'44.848437;-0.611871\n' +
		'44.831571;-0.598711\n' +
		'44.873914;-0.547056\n' +
		'44.8636;-0.570654\n' +
		'44.8636;-0.570654\n' +
		'44.837365;-0.567526\n' +
		'44.851697;-0.578692\n' +
		'44.826202;-0.577882\n' +
		'44.838626;-0.592386\n' +
		'44.853944;-0.617576\n' +
		'44.853894;-0.617546\n' +
		'44.832085;-0.568294\n' +
		'44.832854;-0.605203\n' +
		'44.824092;-0.563459\n' +
		'44.825986;-0.565\n' +
		'44.840044;-0.594302\n' +
		'44.86285;-0.559326\n' +
		'44.824517;-0.596255\n' +
		'44.83271;-0.570368\n' +
		'44.83271;-0.570368';

	const form = new FormData();
	form.append('data', csv);
	try {
		const res = await axios.post('https://api-adresse.data.gouv.fr/reverse/csv/', form, {
			headers: {
				...form.getHeaders(),
				'content-length': '588'
			}
		});
		console.log(res.data);
	} catch (e) {
		console.log((e.request as ClientRequest).getHeaders());
	}
}
