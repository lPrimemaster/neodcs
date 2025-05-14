import { Component, createSignal } from 'solid-js';
import { Card } from './common';
import { MxHistogramPlot } from './api/Plot';
import { MxRdb } from './lib/rdb';
import { MxGenericType } from './lib/convert';
import { MxWebsocket } from './lib/websocket';

const HistogramPlugin: Component = () => {
	const [x, setX] = createSignal<Array<number>>([]);
	const [y, setY] = createSignal<Array<number>>([]);
    const [minx, setMinx] = createSignal<number>(0);
    const [maxx, setMaxx] = createSignal<number>(0);
    const [inc, setInc] = createSignal<number>(0);
    
    let calculateBin = (pos : number) : number => { return 0; };

    const rdb = new MxRdb();

    setupHisto().then(() =>
        MxWebsocket.instance.subscribe('analyzer::output', (data: Uint8Array) => {
            const points = MxGenericType.fromData(data).unpack(['float64', 'uint64']);
            console.log(points);
            for(const p of points) {
                const [pos, counts] = p;
                const b = calculateBin(pos);
                console.log(pos, b);
                setY((vy) => {
                    const ny = Array.from(vy);
                    ny[b] += Number(counts);
                    console.log(ny);
                    return ny;
                });
            }
        })
    );

    rdb.watch('/system/run/status', (_: string, value: MxGenericType) => {
        if(value.astype('uint8') == 1) {
            // Run started
            setupHisto();
        }
    });

    async function setupHisto() {
        const min_x = await rdb.read('/user/runcont/c2/start');
        setMinx(min_x);

        const max_x = await rdb.read('/user/runcont/c2/stop');
        setMaxx(max_x);

        const incv = await rdb.read('/user/runcont/c2/increment');
        setInc(incv);

        const nbins = Math.trunc((max_x - min_x) / incv);
        setX([...new Array<number>(nbins).keys()].map(x => min_x + x * incv));
        setY(new Array<number>(nbins).fill(0));

        calculateBin = (pos : number) : number => {
            return Math.trunc((pos - minx()) * inc());
        };
    }

	return (
		<Card title="Online Bins">
			<MxHistogramPlot
				series={[{}, { label: 'Counts', stroke: 'blue' }]}
				x={x()}
				y={[y()]}
				scales={{ x: { time: false, min: minx(), max: maxx() }}}
				class="w-full mb-5"
				dimensions={[0, 280]}
			/>
		</Card>
	);
};

export const pname = 'Histogram Viewer';
export const render = HistogramPlugin;
export const icon = () => {
	return (
		<svg width="120px" height="100px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M12 15.9998C11.4477 15.9998 11 16.4475 11 16.9998C11 17.5521 11.4477 17.9998 12 17.9998C12.5523 17.9998 13 17.5521 13 16.9998C13 16.4475 12.5523 15.9998 12 15.9998ZM12 15.9998L12.0071 10.5M12 16.9998L12.0071 17.0069M16 16.9998C16 19.209 14.2091 20.9998 12 20.9998C9.79086 20.9998 8 19.209 8 16.9998C8 15.9854 8.37764 15.0591 9 14.354L9 6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6V14.354C15.6224 15.0591 16 15.9854 16 16.9998Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
	); // Custom icon to display at the plugins project page
};
