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

const JogPlugin : Component = () => {

    let handle: MxRpc | undefined;

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
            return pos;
        }
        else {
            console.log('MxRpc not ready.');
            return 0.0;
        }
    }

    const [s1set, setS1set] = createSignal<number>(0);
    const [s1val, setS1val] = createSignal<string>('0');

    const [s2set, setS2set] = createSignal<number>(0);
    const [s2val, setS2val] = createSignal<string>('0');

    const [s3set, setS3set] = createSignal<number>(0);
    const [s3val, setS3val] = createSignal<string>('0');

    setInterval(async () => {
        setS1val((await getPosition(0)).toFixed(4));
        setS2val((await getPosition(1)).toFixed(4));
        setS3val((await getPosition(2)).toFixed(4));
    }, 500);

	return (
		<div>
            <div class="flex px-5 mb-5 gap-5">
                <MxValueControl title="Motor 1 (C1)" value={s1set()} size="xlarge" onChange={(v: number) => {
                    moveAbsolute(0, v);
                    setS1set(v);
                }} increment={0.1}/>
                <MxValuePanel title="Position (C1)" value={s1val()} reactive size="xlarge" class="px-5"/>
            </div>
            <div class="flex px-5 mb-5 gap-5">
                <MxValueControl title="Motor 2 (C2)" value={s2set()} size="xlarge" onChange={(v: number) => {
                    moveAbsolute(1, v);
                    setS2set(v);
                }} increment={0.1}/>
                <MxValuePanel title="Position (C2)" value={s2val()} reactive size="xlarge" class="px-5"/>
            </div>
            <div class="flex px-5 mb-5 gap-5">
                <MxValueControl title="Motor 3 (DE)" value={s3set()} size="xlarge" onChange={(v: number) => {
                    moveAbsolute(2, v);
                    setS3set(v);
                }} increment={0.1}/>
                <MxValuePanel title="Position (DE)" value={s3val()} reactive size="xlarge" class="px-5"/>
            </div>
        </div>
	);
};

export const pname = 'Engine Jog';
export const render = JogPlugin;
export const version = __APP_VERSION__;
export const brief = 'Allows one to jog the motors at will.';
export const author = 'César Godinho';