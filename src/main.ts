import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'

const baseUrl = 'https://nuxmv.fbk.eu/theme/download.php?file='

const windowsUrl = baseUrl + 'nuXmv-2.1.0-win64.7z'
const linuxUrl = baseUrl + 'nuXmv-2.1.0-linux64.tar.xz'
const macosUrl = baseUrl + 'nuXmv-2.1.0-macos-universal.tar.xz'

const macosSha256 =
  'dc0a1710f0ae9f36e16238d40b35dcf66f823d357013bd2e74c09f6e9b9c6dd5'
const winSha256 =
  'ad1f0f1df931eb274da21f1fbebee4ba1949ef5c1718650b84ba82cf2e579f1f'
const linuxSha256 =
  'c7dfec43749bcb230c857efe81099b95d868b94efd9f81bccebe542a306a7c83'

export async function run(): Promise<void> {
  // first find if nuXmv is already installed
  const toolPath = tc.find('nuXmv', '2.1.0')
  if (toolPath) {
    core.addPath(toolPath + '/bin')
    return
  }

  // here we need to download and extract nuXmv
  let folder: string
  if (process.platform === 'win32') {
    const download = await tc.downloadTool(windowsUrl)
    folder = await tc.extract7z(download, 'nuxmv')
  } else if (process.platform === 'darwin') {
    const download = await tc.downloadTool(macosUrl)
    folder = await tc.extractXar(download, 'nuxmv')
  } else {
    const download = await tc.downloadTool(linuxUrl)
    folder = await tc.extractTar(download, 'nuxmv')
  }

  // add it to the cache
  const cachedPath = await tc.cacheDir(folder, 'nuXmv', '2.1.0')
  core.addPath(cachedPath + '/bin')
}
