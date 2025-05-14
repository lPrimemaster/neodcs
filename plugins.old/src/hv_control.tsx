import { Component, JSXElement, onMount, createSignal, Show } from 'solid-js';
import { MxRdb } from './lib/rdb';
import { MxRpc } from './lib/rpc';
import { MxGenericType } from './lib/convert';

import { MxButton } from './api/Button';
import { MxValueControl } from './api/ValueControl';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { BadgeLabel } from './components/ui/badge-label';


const Card: Component<{title: string, children?: JSXElement}> = (props) => {
    return (
        <div class="bg-gray-100 p-5 mb-5 rounded-md shadow-md hover:shadow-lg" style="break-inside: avoid-column;">
            <h1 class="text-md text-center font-medium">{props.title}</h1>
            <div>{props.children}</div>
        </div>
    );
};

const HVControlPlugin : Component = () => {
    const [volts, setVolts] = createSignal<number>(0);
    const [amperes, setAmperes] = createSignal<number>(0);
    const [tempStatus, setTempStatus] = createSignal<boolean>(false);
    const [WaterStatus, setWaterStatus] = createSignal<boolean>(false);
    const [Circuit1Status, setCircuit1Status] = createSignal<boolean>(false);
    const [Circuit2Status, setCircuit2Status] = createSignal<boolean>(false);
    const [LowpowerStatus, setLowpowerStatus] = createSignal<boolean>(false);
    const [ActualkVStatus, setActualkVStatus] = createSignal<number>(0);
    const [ActualmAStatus, setActualmAStatus] = createSignal<number>(0);
    const [TargetkVStatus, setTargetkVStatus] = createSignal<number>(0);
    const [TargetmAStatus, setTargetmAStatus] = createSignal<number>(0);
    const [MaxkVStatus, setMaxkVStatus] = createSignal<number>(100);
    const [MaxmAStatus, setMaxmAStatus] = createSignal<number>(30);
    const [MaxWStatus, setMaxWStatus] = createSignal<number>(3000);
    const [MinkV5mAStatus, setMinkV5mAStatus] = createSignal<number>(10);
    const [Useractual_MaxkV, setUseractual_MaxkV] = createSignal<number>(100);
    const [Useractual_MaxmA, setUseractual_MaxmA] = createSignal<number>(30);
    const [Useractual_MinkV, setUseractual_MinkV] = createSignal<number>(15);
    const [Useractual_MinmA, setUseractual_MinmA] = createSignal<number>(10);
    
    


    const rdb = new MxRdb();
    const rpc = MxRpc.Create();
  

    function writeVolts (value: number): void {
        setVolts(value);
    }

    function writeAmps (value: number): void {
        setAmperes(value);
        rdb.write('/user/generator/mA', amperes());
    }

    function setGeneratorParams(): void {
        rpc.then(async (handle) => {
          // const data = MxGenericType.concatData([
          //   MxGenericType.uint8(volts()),
          //   MxGenericType.uint8(amperes())
          // ]);
          
          const res: MxGenericType = await handle.BckCallUserRpc([
              MxGenericType.str32('hv_control'), // Executable name (as listed in home page)
              MxGenericType.uint8(volts(), 'generic'), // Custom data
              MxGenericType.int64(10000)          // Timeout in ms
          ]);
        });
        // MxWebsocket.instance.rpc_call('mulex::BckCallUserRpc',  [MxGenericType.str512('hv_control.exe'), MxGenericType.fromData(new Uint8Array([volts(), amperes()]))]).then((res: MxGenericType) => {
        //     console.log(res);
        // });

    }

 

    onMount(() => {
        rdb.read('/user/generator/Temperature').then((status: boolean) => setTempStatus(status));

        rdb.watch('/user/generator/Temperature', (key: string, value: MxGenericType) => {
          setTempStatus(value.astype('bool'));
        });


        rdb.read('/user/generator/Water').then((status: boolean) => setWaterStatus(status));

        rdb.watch('/user/generator/Water', (key: string, value: MxGenericType) => {
          setWaterStatus(value.astype('bool'));
        });


        rdb.read('/user/generator/Safety_circuit_1').then((status: boolean) => setCircuit1Status(status));

        rdb.watch('/user/generator/Safety_circuit_1', (key: string, value: MxGenericType) => {
          setCircuit1Status(value.astype('bool'));
        });


        rdb.read('/user/generator/Safety_circuit_2').then((status: boolean) => setCircuit2Status(status));

        rdb.watch('/user/generator/Safety_circuit_2', (key: string, value: MxGenericType) => {
          setCircuit2Status(value.astype('bool'));
        });


        rdb.read('/user/generator/Low_power').then((status: boolean) => setLowpowerStatus(status));

        rdb.watch('/user/generator/Low_power', (key: string, value: MxGenericType) => {
          setLowpowerStatus(value.astype('bool'));
        });

        rdb.read('/user/generator/actual_kV').then((status: number) => setActualkVStatus(status));

        rdb.watch('/user/generator/actual_kV', (key: string, value: MxGenericType) => {
          setActualkVStatus(value.astype('int32'));
        });

        rdb.read('/user/generator/actual_mA').then((status: number) => setActualmAStatus(status));

        rdb.watch('/user/generator/actual_mA', (key: string, value: MxGenericType) => {
          setActualmAStatus(value.astype('int32'));
        });

        rdb.read('/user/generator/target_kV').then((status: number) => setTargetkVStatus(status));

        rdb.watch('/user/generator/target_kV', (key: string, value: MxGenericType) => {
          setTargetkVStatus(value.astype('int32'));
        });

        rdb.read('/user/generator/target_mA').then((status: number) => setTargetmAStatus(status));

        rdb.watch('/user/generator/target_mA', (key: string, value: MxGenericType) => {
          setTargetmAStatus(value.astype('int32'));
        });

        rdb.read('/user/generator/maxkV').then((status: number) => setMaxkVStatus(status));

        rdb.watch('/user/generator/maxkV', (key: string, value: MxGenericType) => {
          setMaxkVStatus(value.astype('uint32'));
        });

        rdb.read('/user/generator/maxmA').then((status: number) => setMaxmAStatus(status));

        rdb.watch('/user/generator/maxmA', (key: string, value: MxGenericType) => {
          setMaxmAStatus(value.astype('uint32'));
        });

        rdb.read('/user/generator/maxW').then((status: number) => setMaxWStatus(status));

        rdb.watch('/user/generator/maxW', (key: string, value: MxGenericType) => {
          setMaxWStatus(value.astype('uint32'));
        });

        rdb.read('/user/generator/minkV_to_5mA').then((status: number) => setMinkV5mAStatus(status));

        rdb.watch('/user/generator/minkV_to_5mA', (key: string, value: MxGenericType) => {
          setMinkV5mAStatus(value.astype('uint32'));
        });

        rdb.read('/user/generator/useredit_maxkV').then((status: number) => setUseractual_MaxkV(status));

        rdb.watch('/user/generator/useredit_maxkV', (key: string, value: MxGenericType) => {
          setUseractual_MaxkV(value.astype('uint32'));
        });

        rdb.read('/user/generator/useredit_maxmA').then((status: number) => setUseractual_MaxmA(status));

        rdb.watch('/user/generator/useredit_maxmA', (key: string, value: MxGenericType) => {
          setUseractual_MaxmA(value.astype('uint32'));
        });

        rdb.read('/user/generator/useredit_minkV').then((status: number) => setUseractual_MinkV(status));

        rdb.watch('/user/generator/useredit_minkV', (key: string, value: MxGenericType) => {
          setUseractual_MinkV(value.astype('uint32'));
        });

        rdb.read('/user/generator/useredit_minmA').then((status: number) => setUseractual_MinmA(status));

        rdb.watch('/user/generator/useredit_minmA', (key: string, value: MxGenericType) => {
          setUseractual_MinmA(value.astype('uint32'));
        });


    });

  return (
    <div>
      <Card title="HV Generator Panel">
        <div class='grid grid-flow-col justify-center grid-cols-6 grid-rows-2 gap-5'>
          <MxValueControl title="Volts" class="col-span-2 row-span-2 m-1" value={volts()} onChange={writeVolts} size="xlarge" increment={5} min={Useractual_MinkV()} max={Useractual_MaxkV()} units="kV"/>
          <MxValueControl title="Amps" class="col-span-2 row-span-2 m-1" value={amperes()} onChange={writeAmps} size="xlarge" increment={5} min={Useractual_MinmA()} max={Useractual_MaxmA()} units="mA"/>
          <MxButton class="col-span-2 row-span-2 m-1" onClick={setGeneratorParams}>Set</MxButton>
        </div>
      </Card>

      <Card title="Generator Status">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Temperature Status</TableHead>
              <TableHead>Water Status</TableHead>
              <TableHead>Safety_circuit 1</TableHead>
              <TableHead>Safety_circuit 2</TableHead>
              <TableHead>Low Power</TableHead>
              <TableHead>Actual kV</TableHead>
              <TableHead>Actual mA</TableHead>
              <TableHead>Target kV</TableHead>
              <TableHead>Target mA</TableHead>
              <TableHead>Max kV</TableHead>
              <TableHead>Max mA</TableHead>
              <TableHead>Max W</TableHead>
              <TableHead>Min kV to 5mA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell class="p-0">
                <Show when={tempStatus()}>
                  <BadgeLabel type="success">ON</BadgeLabel>
                </Show>
                <Show when={!tempStatus()}>
                  <BadgeLabel type="error">OFF</BadgeLabel>
                </Show>
              </TableCell>

              <TableCell class="p-0">
                <Show when={WaterStatus()}>
                  <BadgeLabel type="success">ON</BadgeLabel>
                </Show>
                <Show when={!WaterStatus()}>
                  <BadgeLabel type="error">OFF</BadgeLabel>
                </Show>
              </TableCell>
              
              <TableCell class="p-0">
                <Show when={Circuit1Status()}>
                  <BadgeLabel type="success">ON</BadgeLabel>
                </Show>
                <Show when={!Circuit1Status()}>
                  <BadgeLabel type="error">OFF</BadgeLabel>
                </Show>
              </TableCell>

              <TableCell class="p-0">
                <Show when={Circuit2Status()}>
                  <BadgeLabel type="success">ON</BadgeLabel>
                </Show>
                <Show when={!Circuit2Status()}>
                  <BadgeLabel type="error">OFF</BadgeLabel>
                </Show>
              </TableCell>

              <TableCell class="p-0">
                <Show when={LowpowerStatus()}>
                  <BadgeLabel type="success">ON</BadgeLabel>
                </Show>
                <Show when={!LowpowerStatus()}>
                  <BadgeLabel type="error">OFF</BadgeLabel>
                </Show>
              </TableCell>

              <TableCell class="p-0">{ActualkVStatus()}</TableCell>

              <TableCell class="p-0">{ActualmAStatus()}</TableCell>

              <TableCell class="p-0">{TargetkVStatus()}</TableCell>

              <TableCell class="p-0">{TargetmAStatus()}</TableCell>

              <TableCell class="p-0">{MaxkVStatus()}</TableCell>

              <TableCell class="p-0">{MaxmAStatus()}</TableCell>

              <TableCell class="p-0">{MaxWStatus()}</TableCell>

              <TableCell class="p-0">{MinkV5mAStatus()}</TableCell>
              
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
   
};
   

   
// export default HVControl;
export const pname = 'HV Generator Control';
export const render = HVControlPlugin;
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
