import { provider } from 'std-env'
import { NoneBrowserProvider } from '../node/browser/none'
import { PlaywrightBrowserProvider } from '../node/browser/playwright'
import { WebdriverBrowserProvider } from '../node/browser/webdriver'
import type { BrowserProviderModule, ResolvedBrowserOptions } from '../types/browser'

interface Loader {
  executeId: (id: string) => Promise<{ default: BrowserProviderModule }>
}

export async function getBrowserProvider(options: ResolvedBrowserOptions, loader: Loader): Promise<BrowserProviderModule> {
  const stackblitz = provider === 'stackblitz'
  switch (options.provider) {
    case undefined:
    case 'webdriverio':
      return stackblitz ? NoneBrowserProvider : WebdriverBrowserProvider

    case 'playwright':
      return stackblitz ? NoneBrowserProvider : PlaywrightBrowserProvider

    case 'none':
      return NoneBrowserProvider

    default:
      break
  }

  let customProviderModule

  try {
    customProviderModule = await loader.executeId(options.provider)
  }
  catch (error) {
    throw new Error(`Failed to load custom BrowserProvider from ${options.provider}`, { cause: error })
  }

  if (customProviderModule.default == null)
    throw new Error(`Custom BrowserProvider loaded from ${options.provider} was not the default export`)

  return customProviderModule.default
}
