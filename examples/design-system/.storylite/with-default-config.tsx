import type { SLFunctionComponent, Story } from '@storylite/storylite';

/* -------------------------------------------------------------------------------------------------
 * withDefaultConfig
 * -----------------------------------------------------------------------------------------------*/

function withDefaultConfig<T extends SLFunctionComponent>(story: Story<T>): Story<T> {
  return {
    ...story,
    navigation: { hidden: true, ...story.navigation },
    decorators: [
      (Comp: any, context) => {
        return (
          <div style={{ padding: 20, borderRadius: '8px', background: '#ddd' }}>
            <Comp {...context?.args} />
          </div>
        );
      },
    ],
  };
}

/* ---------------------------------------------------------------------------------------------- */

export { withDefaultConfig };
