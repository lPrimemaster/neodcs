import { Component, createSignal, onCleanup, onMount } from 'solid-js';
import { Card } from './common';
import { MxValuePanel } from './api/ValuePanel';
import { MxGenericPlot } from './api/Plot';
import { MxRdb } from './lib/rdb';

const TemperaturePlugin : Component = () => {
	const [c1Temp, setC1Temp] = createSignal<number>(0);
	const [c2Temp, setC2Temp] = createSignal<number>(0);
	const [x, setX] = createSignal<Array<number>>([]);
	const [y1, setY1] = createSignal<Array<number>>([]);
	const [y2, setY2] = createSignal<Array<number>>([]);

	const rdb = new MxRdb();
	const npoints = 500;

	function appendPlot(ts: number, t0: number, t1: number) : void {
		setX(x => { const nx = Array.from(x); nx.push(ts); return nx.slice(-npoints); });
		setY1(x => { const nx = Array.from(x); nx.push(t0); return nx.slice(-npoints); });
		setY2(x => { const nx = Array.from(x); nx.push(t1); return nx.slice(-npoints); });
	}

	async function fetchNewTemperatures() {
		const tc1 = await rdb.read('/user/temperature/c1');
		const tc2 = await rdb.read('/user/temperature/c2');
		const ts = Date.now() / 1000;

		setC1Temp(tc1);
		setC2Temp(tc2);

		appendPlot(ts, tc1, tc2);
	}

	// Update only once per second on this page
	setInterval(() => fetchNewTemperatures(), 1000);

	return (
		<Card title="Temperature Monitor">
			<div class="flex gap-5 place-content-center">
				<MxValuePanel title="C1 Temperature" size="xlarge" value={c1Temp().toFixed(2)} reactive/>
				<MxValuePanel title="C2 Temperature" size="xlarge" value={c2Temp().toFixed(2)} reactive/>
			</div>
			<MxGenericPlot
				series={[{}, { label: 'C1 Temperature', stroke: 'blue' }, { label: 'C2 Temperature', stroke: 'red' }]}
				x={x()}
				y={[y1(), y2()]}
				scales={{ x: { time: true }}}
				class="w-full mb-5"
				dimensions={[0, 280]}
			/>
		</Card>
	);
};

export const pname = 'Temperature Viewer';
export const render = TemperaturePlugin;
export const icon = () => {
	return (
		<svg width="120px" height="100px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M12 15.9998C11.4477 15.9998 11 16.4475 11 16.9998C11 17.5521 11.4477 17.9998 12 17.9998C12.5523 17.9998 13 17.5521 13 16.9998C13 16.4475 12.5523 15.9998 12 15.9998ZM12 15.9998L12.0071 10.5M12 16.9998L12.0071 17.0069M16 16.9998C16 19.209 14.2091 20.9998 12 20.9998C9.79086 20.9998 8 19.209 8 16.9998C8 15.9854 8.37764 15.0591 9 14.354L9 6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6V14.354C15.6224 15.0591 16 15.9854 16 16.9998Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
	); // Custom icon to display at the plugins project page
};
