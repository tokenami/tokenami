import { css } from '~/css';

export const links = () => [{ rel: 'stylesheet', href: '/tokenami.css' }];

export default function Index() {
  const button = css(
    { '---all': 'unset' },
    {
      size: {
        small: {
          '---padding-top': '3px',
          '---padding-bottom': '3px',
          '---padding-left': '5px',
          '---padding-right': '5px',
          '---border': '1px solid green',
        },
        large: {
          '---padding': '10px',
          '---border': '3px solid red',
        },
      },
    }
  );

  return (
    <>
      <button
        style={button(
          { size: 'small' },
          { '---padding': '20px', '---border-left-width': '30px' },
          { '---p': 30 },
          { '---pl': 2 }
        )}
      >
        test
      </button>
      <button
        style={button(
          { size: 'large' },
          { '---padding': '20px', '---border-right-width': '30px' },
          { '---pl': 2 },
          { '---p': 30 }
        )}
      >
        test
      </button>
    </>
  );
}
