import { Component, createSignal, onMount } from 'solid-js';
import { MxHistogramPlot } from './api/Plot';
import { MxRdb } from './lib/rdb';
import { MxGenericType } from './lib/convert';
import { MxWebsocket } from './lib/websocket';
import { MxValuePanel } from './api/ValuePanel';
import { Card } from './common';

const MCASpectrumPlugin : Component = () => {
	const [mcaChannels, setMcaChannels] = createSignal<number>(0);
	const [inrate, setInrate] = createSignal<number>(0);
	const [outrate, setOutrate] = createSignal<number>(0);
	const [x, setX] = createSignal<Array<number>>(new Array());
	const [y, setY] = createSignal<Array<number>>(new Array());
	// const [ylim, setYlim] = createSignal<number>(100);

	const rdb = new MxRdb();

	// createEffect(() => {
	// 	setYlim(Math.max(...y()));
	// });

	function loadEntries() {
		rdb.read('/user/axas/number_mca_channels').then((channels: number) => {
			setMcaChannels(Math.trunc(channels));
			const xdata = new Array<number>();
			for(let i = 0; i < channels; i++) {
				xdata.push(i);
			}
			setX(xdata);
			setY(Array(channels).fill(0));
		});

		rdb.watch('/user/axas/number_mca_channels', (_: string, v: MxGenericType) => {
			const channels = Math.trunc(v.astype('float64'));
			setMcaChannels(channels);
			const xdata = new Array<number>();
			for(let i = 0; i < channels; i++) {
				xdata.push(i);
			}
			setX(xdata);
			setY(Array(channels).fill(0));
		});

		rdb.read('/user/axas/stats/inrate').then((rate: number) => setInrate(rate));
		rdb.read('/user/axas/stats/outrate').then((rate: number) => setOutrate(rate));
		rdb.watch('/user/axas/stats/inrate', (_: string, v: MxGenericType) => setInrate(v.astype('float64')));
		rdb.watch('/user/axas/stats/outrate', (_: string, v: MxGenericType) => setOutrate(v.astype('float64')));
	}

	function startCaptureWaveform() {
		MxWebsocket.instance.subscribe('axas::mcadata', (data: Uint8Array) => {
			const arr = new Uint32Array(data.buffer, 0);
			setY(Array.from(arr));
		});
	}

	onMount(() => {
		MxWebsocket.instance.on_connection_change((conn: boolean) => {
			if(conn) {
				loadEntries();
				startCaptureWaveform();
			}
		});

		loadEntries();
		startCaptureWaveform();
	});

	return (
		<div>
			<Card title="Statistics">
				<div class="flex gap-5">
					<MxValuePanel title="Input Rate" size="xlarge" value={inrate()} reactive/>
					<MxValuePanel title="Output Rate" size="xlarge" value={outrate()} reactive/>
					<MxValuePanel title="# Channels" size="xlarge" value={mcaChannels()}/>
				</div>
			</Card>
			<Card title="Spectrum">
				<div class="mb-5">
					<MxHistogramPlot
						series={[{}, { label: 'Raw Spectrum', stroke: 'black' }]}
						x={x()}
						y={[y()]}
						scales={{ x: { time: false }, y: { range: [0, 100] } }}
						class="h-56 w-full"
						autoYScale
					/>
				</div>
			</Card>
		</div>
	);
};

export const pname = 'MCA Spectrum';
export const render = MCASpectrumPlugin;
export const icon = () => {
	return (
		<svg width="120px" height="100px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12 6C12 5.44772 11.5523 5 11 5C10.4477 5 10 5.44772 10 6V16C10 16.5523 10.4477 17 11 17C11.5523 17 12 16.5523 12 16V6ZM9 9C9 8.44772 8.55228 8 8 8C7.44772 8 7 8.44772 7 9V16C7 16.5523 7.44772 17 8 17C8.55228 17 9 16.5523 9 16V9ZM15 9C15 8.44772 14.5523 8 14 8C13.4477 8 13 8.44772 13 9V16C13 16.5523 13.4477 17 14 17C14.5523 17 15 16.5523 15 16V9ZM18 13C18 12.4477 17.5523 12 17 12C16.4477 12 16 12.4477 16 13V16C16 16.5523 16.4477 17 17 17C17.5523 17 18 16.5523 18 16V13ZM6 15C6 14.4477 5.55228 14 5 14C4.44772 14 4 14.4477 4 15V16C4 16.5523 4.44772 17 5 17C5.55228 17 6 16.5523 6 16V15ZM21 15C21 14.4477 20.5523 14 20 14C19.4477 14 19 14.4477 19 15V16C19 16.5523 19.4477 17 20 17C20.5523 17 21 16.5523 21 16V15ZM4 18C3.44772 18 3 18.4477 3 19C3 19.5523 3.44772 20 4 20H21C21.5523 20 22 19.5523 22 19C22 18.4477 21.5523 18 21 18H4Z" fill="#000000"></path> </g></svg>
	); // Custom icon to display at the plugins project page
};
