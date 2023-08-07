export const links = () => [{ rel: 'stylesheet', href: '/tokenami.css' }];

export default function Index() {
  return (
    <div
      style={{
        ['--radial-gradient' as any]: 'radial-gradient(circle, #000000 1px, rgba(0, 0, 0, 0) 1px)',
        ['--grid-bg-size' as any]: 'calc(var(---grid) * 5)',
        '---background-size': 'var(---,var(--grid-bg-size) var(--grid-bg-size))',
        '---background-image': 'var(---,var(--radial-gradient))',
        '---background-color': 'var(---color-sky-500)',
        '---background-position-x': 1,
        '---background-position-y': 0.5,
        '---height': 'var(---size-screen-h)',
        '---display': 'var(---,flex)',
        '---flex-direction': 'var(---,column)',
        '---align-items': 'var(---,center)',
        '---justify-content': 'var(---,center)',
      }}
    >
      <figure
        style={{
          '---bg-color': 'var(---color-slate-100)',
          '---border-radius': 'var(---radii-rounded)',
          '---text-align': 'var(---,center)',
          '---overflow': 'var(---,hidden)',
          '---m': 10,
          '---p': 8,
          '---md_display': 'var(---,flex)',
          '---md_p': 0,
          '---md_text-align': 'var(---,left)',
          '---font-family': 'var(---font-sans)',
          '---line-height': 'var(---,1.8)',
        }}
      >
        <img
          style={{
            '---width': 24,
            '---height': 24,
            '---border-radius': 'var(---radii-circle)',
            '---object-fit': 'var(---,cover)',
            '---md_width': 'var(---,11rem)',
            '---md_height': 'var(---size-auto)',
            '---md_border-radius': 'var(---radii-none)',
          }}
          src="/me.jpg"
          alt=""
          width="400"
          height="400"
        />
        <div style={{ '---pt': 4, '---md_p': 8 }}>
          <blockquote style={{ '---m': 0 }}>
            <p
              style={{
                '---font-size': 'var(---,1.125rem)',
                '---line-height': 'var(---,1.75rem)',
                '---font-weight': 'var(---,500)',
                '---m': 0,
                '---mb': 4,
              }}
            >
              "Like Tailwind, but atomic tokens."
            </p>
          </blockquote>
          <figcaption style={{ '---font-weight': 'var(---,500)' }}>
            <div style={{ '---color': 'var(---color-sky-500)' }}>Jenna Smith</div>
            <div style={{ '---color': 'var(---color-slate-700)' }}>@jjenzz</div>
          </figcaption>
        </div>
      </figure>

      <button
        style={{
          '---width': 'var(---,180px)',
          '---height': 15,
          '---border-radius': 'var(---radii-rounded)',
          '---border': 'var(---,none)',
          '---font-family': 'var(---font-sans)',
          '---font-size': 'var(---,20px)',
          '---bg-color': 'var(---color-slate-100)',
          '---hover_background-color': 'var(---color-slate-700)',
          '---hover_color': 'var(---,white)',
          '---transition': 'var(---,all 150ms)',
          // TODO: THIS SHOULD NOT BE POSSIBLE
          '---page-break-after': 'var(---color-slate-100)',
        }}
      >
        Button
      </button>
    </div>
  );
}
