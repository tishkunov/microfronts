/**
 * Microfrontend registry
 * Метаданные о всех доступных MF
 */

export interface MicrofrontendMetadata {
  name: string;
  url: string;
  version?: string;
  entryPoint: string;
}

class MicrofrontendRegistry {
  private registry: Map<string, MicrofrontendMetadata> = new Map();

  register(mf: MicrofrontendMetadata): void {
    this.registry.set(mf.name, mf);
  }

  get(name: string): MicrofrontendMetadata | undefined {
    return this.registry.get(name);
  }

  getAll(): MicrofrontendMetadata[] {
    return Array.from(this.registry.values());
  }

  unregister(name: string): void {
    this.registry.delete(name);
  }

  clear(): void {
    this.registry.clear();
  }
}

export const mfRegistry = new MicrofrontendRegistry();

