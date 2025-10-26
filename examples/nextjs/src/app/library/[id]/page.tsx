import { notFound } from 'next/navigation';
import { Frame } from '@/components/frame';
import * as mockLibrary from '@/mock/library';
import { Cover } from '@/components/cover';
import { TokenamiStyle, css } from '@/css';
import * as cssUtil from '@/css/utils';
import { Heading } from '@/components/heading';
import { IconButton } from '@/components/icon-button';
import * as TitleCard from '@/components/title-card';
import { Icon } from '@/components/icon';
import * as ButtonGroup from '@/components/button-group';

export default async function LibraryItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = mockLibrary.list.find((item) => item.id === id);

  if (!item) return notFound();
  const color = mockLibrary.colors[item.colorIndex];

  return (
    <Frame
      color={color}
      style={{
        '--flex': 'var(--flex_1)',
        '--display': 'flex',
        '--flex-direction': 'column',
        '--gap': 1,
      }}
    >
      <div style={css({ '--display': 'flex', '--px': 5, '--pt': 10, '--pb': 7, '--gap': 6 })}>
        <Cover
          color={color}
          size="3xl"
          style={{ '--box-shadow': 'var(--shadow_xl)', '--shadow-color': 'var(--color_blackA5)' }}
        />

        <div
          style={css({
            '--display': 'grid',
            '--grid-template-columns': 'var(---, 1fr)',
            '--grid-template-rows': 'var(---, min-content min-content)',
            '--grid-template-areas': 'var(---, "type" "title")',
            '--mt': 'var(---, auto)',
            '--gap': 1,
          })}
        >
          <Heading
            level={2}
            variant={1}
            style={{
              '--dark_color': 'var(--color_white)',
              '--light_color': 'var(--color_black)',
              '--font-size': 'var(--text-size_7xl)',
              '--font-weight': 'var(--weight_extrabold)',
              '--line-height': 'var(--leading_none)',
              '--grid-area': 'var(---, title)',
            }}
          >
            {item.title}
          </Heading>

          <p
            style={css({
              '--grid-area': 'var(---, type)',
              '--font-weight': 'var(--weight_normal)',
            })}
          >
            {item.type}
          </p>
        </div>
      </div>
      <div
        style={css({
          '--background-color': 'var(--mix-bg_opacity)',
          '--mix-bg-color': 'var(--color_gray2)',
          '--mix-bg-percent': 10,
          '--flex': 'var(--flex_1)',
          '--display': 'flex',
          '--flex-direction': 'column',
          '--gap': 6,
          '--p': 7,
          '--mx': -2,
        })}
      >
        <IconButton
          icon="play-large-fill"
          size="2xl"
          style={{
            '--background-color': 'var(---, #65D368)',
            '--color': 'var(--color_black)',
            '--hover_background-color': 'var(---, #7DED80)',
            '--hover_color': 'var(--color_black)',
            '--transition': 'var(--morph_colors)',
          }}
        >
          PLay
        </IconButton>

        <ButtonGroup.Root>
          <ButtonGroup.Button>Alternative Rock</ButtonGroup.Button>
          <ButtonGroup.Button>Indie</ButtonGroup.Button>
          <ButtonGroup.Button>Blues Rock</ButtonGroup.Button>
          <ButtonGroup.Button>Mellow</ButtonGroup.Button>
          <ButtonGroup.Button>Dark</ButtonGroup.Button>
          <ButtonGroup.Button>Rock</ButtonGroup.Button>
          <ButtonGroup.Button>Dance</ButtonGroup.Button>
          <ButtonGroup.Button>Folk</ButtonGroup.Button>
          <ButtonGroup.Button>Garage Rock</ButtonGroup.Button>
          <ButtonGroup.Button>Electronica</ButtonGroup.Button>
          <ButtonGroup.Button>Americana</ButtonGroup.Button>
          <ButtonGroup.Button>Motivation</ButtonGroup.Button>
          <ButtonGroup.Button>Happy</ButtonGroup.Button>
          <ButtonGroup.Button>Indie Rock</ButtonGroup.Button>
          <ButtonGroup.Button>Modern Rock</ButtonGroup.Button>
        </ButtonGroup.Root>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead style={{ '--text-align': 'right', '--width': 10 }}>#</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Album</TableHead>
              <TableHead>Date added</TableHead>
              <TableHead>
                <Icon name="time-line" role="presentation" />
                <span className={cssUtil.srOnly()}>Duration</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {item.tracks.map((track, index) => (
              <TableRow key={track.id}>
                <TableCell style={{ '--text-align': 'right' }}>{index + 1}</TableCell>
                <TableCell>
                  <TitleCard.Root>
                    <TitleCard.Graphic
                      size="sm"
                      color={mockLibrary.colors[index % mockLibrary.colors.length]}
                    />
                    <TitleCard.Title variant={6}>{track.title}</TitleCard.Title>
                    <TitleCard.Description>{track.artist}</TitleCard.Description>
                  </TitleCard.Root>
                </TableCell>
                <TableCell>{track.album}</TableCell>
                <TableCell>{track.createdAt}</TableCell>
                <TableCell>{track.duration}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Frame>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Table
 * -----------------------------------------------------------------------------------------------*/

const Table = (props: TokenamiStyle<React.ComponentProps<'table'>>) => {
  const [cn, css] = table();
  return <table {...props} className={cn(props.className)} style={css(props.style)} />;
};

const table = css.compose({
  '--width': 'var(--size_full)',
  '--table-layout': 'fixed',
});

/* -------------------------------------------------------------------------------------------------
 * TableHeader
 * -----------------------------------------------------------------------------------------------*/

const TableHeader = (props: TokenamiStyle<React.ComponentProps<'thead'>>) => {
  const [cn, css] = tableHeader();
  return <thead {...props} className={cn(props.className)} style={css(props.style)} />;
};

const tableHeader = css.compose({
  '--border-bottom': 'var(--line_px)',
  '--border-color': 'var(--color_gray4)',
});

/* -------------------------------------------------------------------------------------------------
 * TableBody
 * -----------------------------------------------------------------------------------------------*/

const TableBody = (props: TokenamiStyle<React.ComponentProps<'tbody'>>) => {
  const [cn, css] = tableBody();
  return <tbody {...props} className={cn(props.className)} style={css(props.style)} />;
};

const tableBody = css.compose({
  '--py': 2,
});

/* -------------------------------------------------------------------------------------------------
 * TableRow
 * -----------------------------------------------------------------------------------------------*/

const TableRow = (props: TokenamiStyle<React.ComponentProps<'tr'>>) => {
  const [cn, css] = tableRow();
  return <tr {...props} className={cn(props.className)} style={css(props.style)} />;
};

const tableRow = css.compose({
  '--color': 'var(--color_gray11)',
  '--font': 'var(--text_xs)',
});

/* -------------------------------------------------------------------------------------------------
 * TableHead
 * -----------------------------------------------------------------------------------------------*/

const TableHead = (props: TokenamiStyle<React.ComponentProps<'th'>>) => {
  const [cn, css] = tableHead();
  return <th {...props} className={cn(props.className)} style={css(props.style)} />;
};

const tableHead = css.compose({
  '--{thead_&}_py': 2,
  '--{thead_&}_font': 'var(--text_xs)',
  '--font-weight': 'var(--weight_normal)',
  '--text-align': 'left',
  '--px': 2,
});

/* -------------------------------------------------------------------------------------------------
 * TableCell
 * -----------------------------------------------------------------------------------------------*/

const TableCell = (props: TokenamiStyle<React.ComponentProps<'td'>>) => {
  const [cn, css] = tableCell();
  return <td {...props} className={cn(props.className)} style={css(props.style)} />;
};

const tableCell = css.compose({
  '--{tbody_tr:first-child_&}_pt': 5,
  '--{tbody_tr:last-child_&}_pb': 5,
  '--text-align': 'left',
  '--px': 2,
  '--py': 2,
});
