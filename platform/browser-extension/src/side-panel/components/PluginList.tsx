import type { Dispatch, SetStateAction } from 'react';
import type { FailedPluginState, PluginState } from '../bridge.js';
import { matchesTool } from '../bridge.js';
import { FailedPluginCard } from './FailedPluginCard.js';
import { PluginCard } from './PluginCard.js';
import { Accordion } from './retro/Accordion.js';

const PluginList = ({
  plugins,
  failedPlugins,
  activeTools,
  setPlugins,
  toolFilter,
  onUpdate,
  onRemove,
  removingPlugins,
  pluginErrors,
  skipPermissions,
}: {
  plugins: PluginState[];
  failedPlugins: FailedPluginState[];
  activeTools: Set<string>;
  setPlugins: Dispatch<SetStateAction<PluginState[]>>;
  toolFilter: string;
  onUpdate?: (pluginName: string) => void;
  onRemove?: (pluginName: string) => void;
  removingPlugins?: Set<string>;
  pluginErrors?: Map<string, string>;
  skipPermissions?: boolean;
}) => {
  const filterLower = toolFilter.toLowerCase();

  const visiblePlugins = filterLower
    ? plugins.filter(p => (p.tools ?? []).some(t => matchesTool(t, filterLower)))
    : plugins;

  // Hide failed plugins when filtering tools
  const visibleFailed = filterLower ? [] : failedPlugins;

  if (filterLower && visiblePlugins.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">No tools matching &ldquo;{toolFilter}&rdquo;</div>
    );
  }

  const readyPlugins = filterLower ? [] : visiblePlugins.filter(p => p.tabState === 'ready');
  const notReadyPlugins = filterLower ? [] : visiblePlugins.filter(p => p.tabState !== 'ready');

  const renderCard = (plugin: PluginState) => (
    <PluginCard
      key={plugin.name}
      plugin={plugin}
      activeTools={activeTools}
      setPlugins={setPlugins}
      toolFilter={toolFilter}
      onUpdate={onUpdate ? () => onUpdate(plugin.name) : undefined}
      onRemove={onRemove ? () => onRemove(plugin.name) : undefined}
      removingPlugin={removingPlugins?.has(plugin.name)}
      actionError={pluginErrors?.get(plugin.name) ?? null}
      skipPermissions={skipPermissions}
    />
  );

  return (
    <>
      {visibleFailed.length > 0 && (
        <div className="mb-3 space-y-2">
          {visibleFailed.map(fp => (
            <FailedPluginCard key={fp.specifier} plugin={fp} />
          ))}
        </div>
      )}
      {filterLower ? (
        <Accordion type="multiple" className="space-y-2">
          {visiblePlugins.map(renderCard)}
        </Accordion>
      ) : (
        <>
          {readyPlugins.length > 0 && (
            <Accordion type="multiple" className="space-y-2">
              {readyPlugins.map(renderCard)}
            </Accordion>
          )}
          {notReadyPlugins.length > 0 && (
            <div>
              <div className="px-3 pt-3 pb-1 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                NOT CONNECTED
              </div>
              <Accordion type="multiple" className="space-y-2">
                {notReadyPlugins.map(renderCard)}
              </Accordion>
            </div>
          )}
        </>
      )}
    </>
  );
};

export { PluginList };
