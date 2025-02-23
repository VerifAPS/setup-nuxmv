import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'

const baseUrl = 'https://nuxmv.fbk.eu/downloads/'

const winName = 'nuXmv-2.1.0-win64'
const linuxName = 'nuXmv-2.1.0-linux64'
const macosName = 'nuXmv-2.1.0-macos-universal'

const windowsUrl = baseUrl + winName + '.7z'
const linuxUrl = baseUrl + linuxName + '.tar.xz'
const macosUrl = baseUrl + macosName + '.tar.xz'

/*
const macosSha256 =
  'dc0a1710f0ae9f36e16238d40b35dcf66f823d357013bd2e74c09f6e9b9c6dd5'
const winSha256 =
  'ad1f0f1df931eb274da21f1fbebee4ba1949ef5c1718650b84ba82cf2e579f1f'
const linuxSha256 =
  'c7dfec43749bcb230c857efe81099b95d868b94efd9f81bccebe542a306a7c83'
*/

export async function run(): Promise<void> {
  core.info(
    'nuXmv can be used only for non-commercial or academic purposes. https://nuxmv.fbk.eu/license.html for details'
  )

  let name: string
  if (process.platform === 'win32') {
    name = winName
  } else if (process.platform === 'darwin') {
    name = macosName
  } else {
    name = linuxName
  }

  // first find if nuXmv is already installed
  let toolPath = tc.find('nuXmv', '2.1.0')
  if (!toolPath) {
    // here we need to download and extract nuXmv
    if (process.platform === 'win32') {
      const download = await tc.downloadTool(windowsUrl)
      toolPath = await tc.extract7z(download, 'nuxmv')
    } else if (process.platform === 'darwin') {
      const download = await tc.downloadTool(macosUrl)
      toolPath = await tc.extractTar(download, 'nuxmv')
    } else {
      const download = await tc.downloadTool(linuxUrl)
      toolPath = await tc.extractTar(download, 'nuxmv', 'xJ')
    }
    // add it to the cache
    toolPath = await tc.cacheDir(toolPath, 'nuXmv', '2.1.0')
  }

  const path = `${toolPath}/${name}/bin`
  core.addPath(path)
  core.debug(`nuXmv installed to ${path}`)
}
