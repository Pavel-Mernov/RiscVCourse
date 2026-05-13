import { Typography, type TypographyProps } from "@mui/material";
import Link from "@mui/material/Link";

type Props = {
    children : string
}

const urlRegex = /(https?:\/\/[^\s]+)/g;

type Part = string | { ul: string[] };


const parseText = (text: string): Part[] => {
  const lines = text
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  const result: Part[] = [];

  let currentList: string[] | undefined = undefined;

  for (const line of lines) {
    const match = line.match(/^\*\s(.*)$/);

    if (match) {
      if (!currentList) {
        currentList = [];
        result.push({ ul: currentList });
      }

      currentList.push(match[1]);
    } else {
      currentList = undefined;
      result.push(line);
    }
  }

  return result;
};

type MappedTextProps = { 
  key ?: string | number, 
  splitParts : string[],
  li ?: boolean
}

const MappedText = ({ li, splitParts } : MappedTextProps) => {
  const children = splitParts.map((part, i) => {
    if (urlRegex.test(part)) {
      return (
        <Link
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
        >
          {part}
        </Link>
        );
    } else {
      return part;
    }
  })

  const props : TypographyProps = {
    children,
    style : { whiteSpace : 'pre-line' },
    variant : 'body1',
    fontSize : '24px',
    textAlign : 'justify',
    ...(li ? {
      component : 'li',
      marginBottom : '1px'
    } : {
      marginTop : '150px'
    })
  }

  return <Typography { ...props } />
}

export default ({ children } : Props) => {
  const paragraphs = parseText(children);

  return (
    <>
      { paragraphs.map((para, idx) => {
        if (typeof para == 'string') {
          const parts = para.split(urlRegex);

          return <MappedText key={ idx } splitParts={ parts } />
        }
        else {
          const parts = para.ul.map(li => li.split(urlRegex))

          return (
            <Typography
              component='ul'
              key={ idx }
              marginTop='100px'
              
              textAlign='justify'
            >
              {
                parts.map((part, i) => (
                  <MappedText key={ i } splitParts={ part } li /> 
                ))
              }
            </Typography>
          )
        }
      })}
    </>
  );
};