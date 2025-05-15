import { Component, onMount, createSignal } from 'solid-js';
import apperture from '../../assets/aperture.svg';
import { MxButton, MxGaugeVertical, MxSelector, MxSpinner, MxSwitch, MxValueControl, MxValuePanel } from '~/api';
import { MxDoubleSwitch } from '~/api/Switch';
import { MxGenericPlot, MxHistogramPlot } from '~/api/Plot';
import { MxRpc } from '~/lib/rpc';
import { MxGenericType } from '~/lib/convert';
import { MxRdb } from '~/lib/rdb';
import { MxEvent } from '~/lib/event';
import { MxWebsocket } from '~/lib/websocket';
import { createSign } from 'crypto';

const WobblePlugin : Component = () => {

    let handle: MxRpc | undefined;
    const rdb = new MxRdb();

    onMount(async () => {
        handle = await MxRpc.Create();
    });

    async function moveAbsolute(axis: number, pos: number) {
        if(handle) {
            const args = MxGenericType.concatData([
                MxGenericType.uint8(axis),
                MxGenericType.uint8(1),
                MxGenericType.f64(pos)
            ]);
            const res = await handle.BckCallUserRpc([
                MxGenericType.str32('esp301.exe'),
                MxGenericType.makeData(args, 'generic'),
                MxGenericType.int64(10000n)
            ]);
            const [_, __] = res.unpack(['uint8', 'int32'])[0];
        }
        else {
            console.log('MxRpc not ready.');
        }
    }

    async function getPosition(axis: number) {
        if(handle) {
            const args = MxGenericType.concatData([
                MxGenericType.uint8(axis),
                MxGenericType.uint8(0)
            ]);
            const res = await handle.BckCallUserRpc([
                MxGenericType.str32('esp301.exe'),
                MxGenericType.makeData(args, 'generic'),
                MxGenericType.int64(10000n)
            ]);
            const [_, pos] = res.unpack(['uint8', 'float64'])[0];
            console.log('status: ', _);
            return pos;
        }
        else {
            console.log('MxRpc not ready.');
            return 0.0;
        }
    }

    function sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function measureWobble() {
        const ax = parseInt(axis());
        moveAbsolute(ax, 0.0);

        let pos = await getPosition(ax);
        setApos(pos);
        while(pos != 0.0) {
            await sleep(100);
            pos = await getPosition(ax);
            setApos(pos);
        }

        moveAbsolute(ax, 360.0);

        pos = await getPosition(ax);
        while(pos < 360.0) {
            await sleep(100);
            pos = await getPosition(ax);
            console.log(pos);
            setApos(pos);
            setX((p) => [...p, pos]);
            setY((p) => [...p, wy()]);
        }
    }

    const [axis, setAxis] = createSignal<string>('0');
    const [apos, setApos] = createSignal<number>(0);
    const [wy, setWy] = createSignal<number>(0);
    const [x, setX] = createSignal<Array<number>>([]);
    const [y, setY] = createSignal<Array<number>>([]);

    rdb.watch('/user/angley', (key: string, value: MxGenericType) => {
        setWy(value.astype('float64'));
    });

	return (
		<div>
            <div class="flex p-5 gap-5">
                <MxSelector title="Axis" options={['0', '1', '2']} onSelect={(value) => { setAxis(value); }} value={axis()} size="xlarge"/>
                <MxButton onClick={measureWobble}>Start</MxButton>
            </div>
            <div class="flex p-5 mb-5 gap-5">
                <MxValuePanel title="Axis Position" value={apos().toFixed(4)} reactive size="xlarge" class="px-5"/>
                <MxValuePanel title="Wobble Y" value={wy().toFixed(4)} reactive size="xlarge" class="px-5"/>
            </div>
            <div class="p-5">
                <MxGenericPlot
                    series={[{}, { label: 'Waveform', stroke: 'black' }]}
                    x={x()}
                    y={[y()]}
                    scales={{ x: { time: false, range: [0.0, 360.0] }, y: { range: [-0.75, -0.25] } }}
                    class="h-56 w-full"
                />
            </div>
        </div>
	);
};

export const pname = 'Calculate/View wobble';
export const render = WobblePlugin;
export const version = __APP_VERSION__;
export const brief = 'View wobble for a given engine.';
export const author = 'César Godinho';