import { build, BuildOptions } from 'esbuild'
import sassPlugin from 'esbuild-plugin-sass'
import sveltePlugin from './svelte'
import { pluginSvg } from './svg'
import { dtsPlugin } from 'esbuild-plugin-d.ts'

/**
 * @public
 */
export async function uiBuild (pkg: any, extra: Partial<BuildOptions>): Promise<void> {
  // Svelte compiler plugin
  const svelte = sveltePlugin({
    compileOptions: {
      // Styles with component
      css: true,
      dev: true,
      errorMode: 'throw'
    }
  })
  const svg = pluginSvg()

  // Build ES-module
  await build(
    Object.assign(
      {
        format: 'esm',
        bundle: true,
        minify: false,
        sourcemap: 'inline',
        legalComments: 'inline',
        color: true,
        keepNames: true,
        plugins: [svelte, sassPlugin(), svg, dtsPlugin()],
        loader: { '.png': 'dataurl' },

        // Ignore dependencies и peerDependencies from package.json
        external: [...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies)]
      },
      extra
    )
  )
}

/**
 * @public
 */
export default function (pkg: any, extra: Partial<BuildOptions>): void {
  uiBuild(pkg, extra).catch((err) => {
    console.log(err)
  })
}
