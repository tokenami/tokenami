import type { SLFunctionComponent, Story } from '@storylite/storylite';
import { useStoryLiteStore } from '@storylite/storylite';

/* -------------------------------------------------------------------------------------------------
 * withDefaultConfig
 * -----------------------------------------------------------------------------------------------*/

function withDefaultConfig<T extends SLFunctionComponent>(story: Story<T>): Story<T> {
  return {
    ...story,
    navigation: { hidden: true, ...story.navigation },
    decorators: [
      (Comp: any, context) => {
        const params = useStoryLiteStore((state) => state.parameters);
        return (
          <div
            className={`theme-${params.theme?.value === 'auto' ? 'light' : params.theme?.value}`}
            style={{ padding: 20, borderRadius: '8px', background: '#ddd' }}
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
