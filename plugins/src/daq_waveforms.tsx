import { Component, JSXElement, Show, createSignal, onMount } from 'solid-js';
import { MxGenericPlot } from './api/Plot';
import { MxRdb } from './lib/rdb';
import { MxSelector } from './api/Selector';
import { MxGenericType } from './lib/convert';
import { MxWebsocket } from './lib/websocket';
import { MxValuePanel } from './api/ValuePanel';
import { MxButton } from './api/Button';

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
	const [xdata, setXData] = createSignal<Array<number>>([]);
	const [ydata, setYData] = createSignal<Array<number>>([]);
	const [channel, setChannel] = createSignal<string>('');
	const [options, setOptions] = createSignal<Set<string>>(new Set());
	const [pChannelMap, setPChannelMap] = createSignal<Map<string, string>>(new Map());
	const [sampleRate, setSampleRate] = createSignal<number>(0);

	const rdb = new MxRdb();

	function loadEntries() {
		MxWebsocket.instance.rpc_call('mulex::RdbListSubkeys', [MxGenericType.str512('/user/signals/*/hardware_channel')], 'generic').then((res: MxGenericType) => {
			const channels: Array<string> = res.astype('stringarray');
			for(const channel of channels) {
				const virtual_channel = channel.split('/')[3];
				rdb.read(channel).then((hardware_channel: string) => {
					setPChannelMap(m => new Map(m).set(virtual_channel, hardware_channel));
					setOptions(s => new Set(s).add(virtual_channel));
				});
			}
			setChannel(channels[0].split('/')[3]);
		});

		rdb.read('/user/nidaq/sample_rate').then((srate: number) => setSampleRate(srate));
	}

	function captureWaveform(virtual_channel: string) {
		MxWebsocket.instance.subscribe('aidaq::' + virtual_channel, (data: Uint8Array) => {
			// First 64bits are the timestamp
			const arr = new Float64Array(data.buffer, 8);
			const ydata = Array.from(arr);
			const xdata = new Array<number>();

			for(let i = 0; i < ydata.length; i++) {
				xdata.push(i);
			}

			setYData(ydata);
			setXData(xdata);
			
			MxWebsocket.instance.unsubscribe('aidaq::' + virtual_channel);
		});
	}

	onMount(() => {
		rdb.watch('/user/signals/*/hardware_channel', (key: string, value: MxGenericType) => {
			const virtual_channel = key.split('/')[3];
			setPChannelMap(m => new Map(m).set(virtual_channel, value.astype('string')));
			setOptions(s => new Set(s).add(virtual_channel));
		});

		MxWebsocket.instance.on_connection_change((conn: boolean) => {
			if(conn) {
				loadEntries();
			}
		});

		loadEntries();
	});

	return (
		<div>
			<Card title="Waveform Panel">
				<div class="flex gap-5">
					<MxSelector title="Channel Name" value={channel()} options={Array.from(options().values())} onSelect={(opt: string) => setChannel(opt)} size="xlarge"/>
					<MxValuePanel title="Physical Channel" value={pChannelMap().get(channel())!} size="xlarge"/>
					<MxValuePanel title="DAQ Sample Rate" value={sampleRate().toFixed(1)} size="xlarge"/>
					<MxButton onClick={() => captureWaveform(channel())}>Capture Waveform</MxButton>
				</div>
			</Card>
			<Show when={xdata().length > 0}>
				<Card title="Waveform">
					<div class="mb-5">
						<MxGenericPlot
							series={[{}, { label: 'Waveform', stroke: 'black' }]}
							x={xdata()}
							y={[ydata()]}
							scales={{ x: { time: false }, y: { range: [-10, 10] } }}
							class="h-56 w-full"
						/>
					</div>
				</Card>
			</Show>
		</div>
	);
};

export const pname = 'DAQ Waveform Viewer';
export const render = WaveformPlugin;
export const icon = () => {
	return (
		<svg width="120px" height="100px" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
			<rect width="48" height="48" fill="white" fill-opacity="0.01"/>
			<path d="M4 24C4 24 6 4 14 4C22 4 23 19 24 24C25 29 28 44 35 44C42 44 44 24 44 24" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
			<path d="M11 24H17" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
			<path d="M31 24H37" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
	); // Custom icon to display at the plugins project page
};
