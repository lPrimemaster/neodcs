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

const TiltStagePlugin : Component = () => {

    let handle: MxRpc | undefined;

    onMount(async () => {
        handle = await MxRpc.Create();
        setInterval(() => getPositions(), 1000);
    });

    async function moveAbsolute(controller: number, axis: number, steps: number) {
        if(handle) {
            const args = MxGenericType.concatData([
                MxGenericType.str32('moveAbsolute'),
                MxGenericType.int32(controller),
                MxGenericType.int32(axis),
                MxGenericType.int32(steps)
            ]);
            const res = await handle.BckCallUserRpc([
                MxGenericType.str32('pmc8742.exe'),
                MxGenericType.makeData(args, 'generic'),
                MxGenericType.int64(10000n)
            ]);
            const [status, ret] = res.unpack(['uint8', 'int32'])[0];
            if(ret != 0) {
                console.error('Failed to send command to backend.');
            }
        }
        else {
            console.log('MxRpc not ready.');
        }
    }

    async function getPositions() {
        if(handle) {
            const args = MxGenericType.concatData([
                MxGenericType.str32('getPositions')
            ]);
            const res = await handle.BckCallUserRpc([
                MxGenericType.str32('pmc8742.exe'),
                MxGenericType.makeData(args, 'generic'),
                MxGenericType.int64(10000n)
            ]);
            const [status, p1, p2, p3, p4] = res.unpack(['uint8', 'int32', 'int32', 'int32', 'int32'])[0];
            setS1val(p1);
            setS2val(p2);
            setS3val(p3);
            setS4val(p4);
        }
        else {
            console.log('MxRpc not ready.');
        }
    }

    const [s1set, setS1set] = createSignal<number>(0);
    const [s1val, setS1val] = createSignal<number>(0);

    const [s2set, setS2set] = createSignal<number>(0);
    const [s2val, setS2val] = createSignal<number>(0);

    const [s3set, setS3set] = createSignal<number>(0);
    const [s3val, setS3val] = createSignal<number>(0);

    const [s4set, setS4set] = createSignal<number>(0);
    const [s4val, setS4val] = createSignal<number>(0);

	return (
		<div>
            <div class="flex px-5 mb-5 gap-5">
                <MxValueControl title="Stage 1 Setpoint" value={s1set()} size="xlarge" onChange={(v: number) => {
                    moveAbsolute(1, 2, v);
                    setS1set(v);
                }} increment={1}/>
                <MxValuePanel title="Stage 1 Step" value={s1val()} reactive size="xlarge" class="px-5"/>
            </div>
            <div class="flex px-5 mb-5 gap-5">
                <MxValueControl title="Stage 2 Setpoint" value={s2set()} size="xlarge" onChange={(v: number) => {
                    moveAbsolute(1, 3, v);
                    setS2set(v);
                }} increment={1}/>
                <MxValuePanel title="Stage 2 Step" value={s2val()} reactive size="xlarge" class="px-5"/>
            </div>
            <div class="flex px-5 mb-5 gap-5">
                <MxValueControl title="Stage 3 Setpoint" value={s3set()} size="xlarge" onChange={(v: number) => {
                    moveAbsolute(2, 1, v);
                    setS3set(v);
                }} increment={1}/>
                <MxValuePanel title="Stage 3 Step" value={s3val()} reactive size="xlarge" class="px-5"/>
            </div>
            <div class="flex px-5 mb-5 gap-5">
                <MxValueControl title="Stage 4 Setpoint" value={s4set()} size="xlarge" onChange={(v: number) => {
                    moveAbsolute(2, 4, v);
                    setS4set(v);
                }} increment={1}/>
                <MxValuePanel title="Stage 4 Step" value={s4val()} reactive size="xlarge" class="px-5"/>
            </div>
        </div>
	);
};

export const pname = 'Tilt Stage Control';
export const render = TiltStagePlugin;
export const version = __APP_VERSION__;
export const brief = 'Controls and reports tilt stage position in steps.';
export const author = 'César Godinho';