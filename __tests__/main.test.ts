import { jest } from '@jest/globals'

const coreMock = {
  info: jest.fn(),
  debug: jest.fn(),
  addPath: jest.fn()
}

const toolCacheMock = {
  find: jest.fn(),
  downloadTool: jest.fn(),
  extract7z: jest.fn(),
  extractTar: jest.fn(),
  cacheDir: jest.fn()
}

jest.unstable_mockModule('@actions/core', () => coreMock)
jest.unstable_mockModule('@actions/tool-cache', () => toolCacheMock)

const { run } = await import('../src/main.js')

describe('run', () => {
  const originalPlatform = process.platform

  beforeEach(() => {
    coreMock.info.mockReset()
    coreMock.debug.mockReset()
    coreMock.addPath.mockReset()
    toolCacheMock.find.mockReset()
    toolCacheMock.downloadTool.mockReset()
    toolCacheMock.extract7z.mockReset()
    toolCacheMock.extractTar.mockReset()
    toolCacheMock.cacheDir.mockReset()
  })

  afterEach(() => {
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
      configurable: true
    })
  })

  it('downloads and caches nuXmv on linux when not already installed', async () => {
    Object.defineProperty(process, 'platform', {
      value: 'linux',
      configurable: true
    })

    toolCacheMock.find.mockReturnValue('')
    toolCacheMock.downloadTool.mockResolvedValue('/tmp/nuxmv.tar.xz')
    toolCacheMock.extractTar.mockResolvedValue('/tmp/extracted')
    toolCacheMock.cacheDir.mockResolvedValue('/tmp/cache')

    await run()

    expect(toolCacheMock.find).toHaveBeenCalledWith('nuXmv', '2.1.0')
    expect(toolCacheMock.downloadTool).toHaveBeenCalledWith(
      'https://nuxmv.fbk.eu/downloads/nuXmv-2.1.0-linux64.tar.xz'
    )
    expect(toolCacheMock.extractTar).toHaveBeenCalledWith(
      '/tmp/nuxmv.tar.xz',
      'nuxmv',
      'xJ'
    )
    expect(toolCacheMock.cacheDir).toHaveBeenCalledWith(
      '/tmp/extracted',
      'nuXmv',
      '2.1.0'
    )
    expect(coreMock.addPath).toHaveBeenCalledWith(
      '/tmp/cache/nuXmv-2.1.0-linux64/bin'
    )
  })

  it('reuses a cached installation when nuXmv is already present', async () => {
    Object.defineProperty(process, 'platform', {
      value: 'darwin',
      configurable: true
    })

    toolCacheMock.find.mockReturnValue('/tmp/cached-install')

    await run()

    expect(toolCacheMock.downloadTool).not.toHaveBeenCalled()
    expect(toolCacheMock.extractTar).not.toHaveBeenCalled()
    expect(coreMock.addPath).toHaveBeenCalledWith(
      '/tmp/cached-install/nuXmv-2.1.0-macos-universal/bin'
    )
  })

  it('uses the system 7z executable to extract nuXmv on windows', async () => {
    Object.defineProperty(process, 'platform', {
      value: 'win32',
      configurable: true
    })

    toolCacheMock.find.mockReturnValue('')
    toolCacheMock.downloadTool.mockResolvedValue('C:/tmp/nuxmv.7z')
    toolCacheMock.extract7z.mockResolvedValue('C:/tmp/extracted')
    toolCacheMock.cacheDir.mockResolvedValue('C:/tmp/cache')

    await run()

    expect(toolCacheMock.downloadTool).toHaveBeenCalledWith(
      'https://nuxmv.fbk.eu/downloads/nuXmv-2.1.0-win64.7z'
    )
    expect(toolCacheMock.extract7z).toHaveBeenCalledWith(
      'C:/tmp/nuxmv.7z',
      'nuxmv',
      '7z'
    )
    expect(coreMock.addPath).toHaveBeenCalledWith(
      'C:/tmp/cache/nuXmv-2.1.0-win64/bin'
    )
  })
})
