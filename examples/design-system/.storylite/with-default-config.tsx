import type { SLFunctionComponent, Story } from '@storylite/storylite';
import { useStoryLiteStore } from '@storylite/storylite';

/* -------------------------------------------------------------------------------------------------
 * withDefaultConfig
 * -----------------------------------------------------------------------------------------------*/

const getPreferredScheme = () =>
  window?.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';

function withDefaultConfig<T extends SLFunctionComponent>(story: Story<T>): Story<T> {
  return {
    ...story,
    navigation: { hidden: true, ...story.navigation },
    decorators: [
      (Comp: any, context) => {
        const paramsMode = useStoryLiteStore((state) => state.parameters).theme?.value;
        const mode = paramsMode === 'auto' ? getPreferredScheme() : paramsMode;
        return (
          <div
            data-theme={mode}
            style={{
              padding: 20,
              borderRadius: '8px',
              background: mode === 'dark' ? 'black' : 'white',
            }}
          >
            <Comp {...context?.args} />
          </div>
        );
      },
    ],
  };
}

/* ---------------------------------------------------------------------------------------------- */

export { withDefaultConfig };
