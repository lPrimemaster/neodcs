import { Component, JSXElement, createSignal, onMount } from 'solid-js';
import { MxEvent } from './lib/event';
import { MxGenericPlot } from './api/Plot';
import { MxValuePanel } from './api/ValuePanel';

// Similar to the MxCard component
const Card: Component<{title: string, children?: JSXElement}> = (props) => {
     return (
         <div class="bg-gray-100 p-5 mb-5 rounded-md shadow-md hover:shadow-lg" style="break-inside: avoid-column;">
             <h1 class="text-md text-center font-medium">{props.title}</h1>
             <div>{props.children}</div>
         </div>
     );
};

const WaveformPlugin : Component = () => {
	const [data, setData] = createSignal<Array<number>>([]);

	// onMount(() => {
	const waveform = new MxEvent('nidaq::apd0_signal');

	const x = [];
	for(let i = 0; i < 1000; i++) {
		x.push(i);
	}

	waveform.onMessage = (data: Uint8Array) => {
		const view = new DataView(data.buffer);
		const y = [];
		for(let i = 1; i < 1001; i++)
		{
			y.push(view.getFloat64(8*i, true));
		}
		setData(y);
	};
	// });

	return (
		<Card title="My Plot">
			<MxGenericPlot series={[{}, { label: 'Waveform', stroke: 'black' }]} x={x} y={[data()]} scales={{ x: { time: false }, y: { range: [-10, 10] } }} class="h-56 w-full"/>
			<MxValuePanel title="My Value" value={data()[0].toFixed(6)} size="xlarge"/>
		</Card>
	);
};

export const pname = 'DAQ Waveform Viewer'; // Name seen by the mx server instance
export const render = WaveformPlugin;
export const icon = () =>
<svg width="120px" height="100px" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
	<rect width="48" height="48" fill="white" fill-opacity="0.01"/>
	<path d="M4 24C4 24 6 4 14 4C22 4 23 19 24 24C25 29 28 44 35 44C42 44 44 24 44 24" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
	<path d="M11 24H17" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
	<path d="M31 24H37" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>; // Custom icon to display at the plugins project page
