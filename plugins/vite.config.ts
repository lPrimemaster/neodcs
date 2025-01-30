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
			lib: {
				entry: `./src/${process.argv[4].split('=')[1]}.tsx`,
				formats: ['es'],
				fileName: (_, name) => `${name}.js`
			},
			outDir: './dist',
			emptyOutDir: false
		},
		resolve: {
			alias: {
				'~': path.resolve(__dirname, './src')
			}
		}
	};
});
