import type { V2_MetaFunction } from '@remix-run/node';

export const meta: V2_MetaFunction = () => {
  return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }];
};

export default function Index() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8', minWidth: '300px' }}>
      {Array.from({ length: 500 }, (_, i) => (
        <figure key={i}>
          <img src="/me.jpg" alt="" width="400" height="400" />
          <div>
            <blockquote>
              <p>
                “Tailwind CSS is the only framework that I've seen scale on large teams. It’s easy
                to customize, adapts to any design, and the build size is tiny.”
              </p>
            </blockquote>
            <figcaption>
              <div>Sarah Dayan</div>
              <div>Staff Engineer, Algolia</div>
            </figcaption>
          </div>
        </figure>
      ))}

      <style
        dangerouslySetInnerHTML={{
          __html: `
          :root {
            --color-slate-100: #f1f5f9;
            --color-slate-700: #334155;
            --color-sky-500: #0ea5e9;
            --radii-rounded: 10px;
            --radii-circle: 9999px;
          }
          figure {
            background-color: var(--color-slate-100);
            border-radius: var(--radii-rounded);
            padding: 32px;
            margin: 40px;
            text-align: center;
            overflow: hidden;
          }
          img {
            width: 6rem;
            height: 6rem;
            border-radius: var(--radii-circle);
            object-fit: cover;
          }
          img + div {
            padding-top: 16px;
          }
          blockquote {
            margin: 0;
          }
          p {
            font-size: 1.125rem;
            line-height: 1.75rem;
            font-weight: 500;
          }
          figcaption {
            font-weight: 500;
          }
          figcaption div:first-child {
            color: var(--color-sky-500);
          }
          figcaption div:last-child {
            color: var(--color-slate-700);
          }

          @media(min-width: 700px) {
            figure {
              display: flex;
              padding: 0;
              text-align: left;
            }
            img {
              width: 11rem;
              height: auto;
              border-radius: 0;
            }
            img + div {
              padding: 32px;
            }
          }
        `,
        }}
      />
    </div>
  );
}
