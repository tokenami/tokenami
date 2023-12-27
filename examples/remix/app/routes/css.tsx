import { css } from '~/css';

export const links = () => [{ rel: 'stylesheet', href: '/tokenami.css' }];

export default function Index() {
  const button = css(
    { '--all': 'unset' },
    {
      size: {
        small: {
          '--padding-top': 'var(---,3px)',
          '--padding-bottom': 'var(---,3px)',
          '--padding-left': 'var(---,5px)',
          '--padding-right': 'var(---,5px)',
          '--border': 'var(---,1px solid green)',
        },
        large: {
          '--padding': 'var(---,10px)',
          '--border': 'var(---,3px solid red)',
        },
      },
    }
  );

  return (
    <>
      <button
        style={button(
          { size: 'small' },
          { '--padding': 'var(---,20px)', '--border-left-width': 'var(---,30px)' },
          { '--p': 30 },
          { '--pl': 2 }
        )}
      >
        test
      </button>
      <button
        style={button(
          { size: 'large' },
          { '--padding': 'var(---,20px)', '--border-right-width': 'var(---,30px)' },
          { '--pl': 2 },
          { '--p': 30 }
        )}
      >
        test
      </button>
    </>
  );
}
