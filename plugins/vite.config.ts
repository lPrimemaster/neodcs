import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import path from 'path';

export default defineConfig((_) => { 
	return {
		plugins: [
			solidPlugin()
		],
		build: {
			target: 'ESNext',
			lib: false,
			rollupOptions: {
				input: {
		  			daqWaveforms: './src/daq_waveforms.tsx',
				},
				output: {
				  	entryFileNames: '[name].js',
				  	format: 'es',
				},
			},
			outDir: './dist'
		},
		resolve: {
			alias: {
				'~': path.resolve(__dirname, './src')
			}
		}
	};
});
