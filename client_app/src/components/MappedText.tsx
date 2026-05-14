import { type TypographyProps, Typography } from "@mui/material";
import Link from "@mui/material/Link";
import CodeInTextView from "./CodeInTextView";

type MappedTextProps = { 
  key ?: string | number, 
  splitParts : (string | { code : string } )[],
  li ?: boolean
}

const urlRegex = /(https?:\/\/[^\s]+)/g;

export default ({ li, splitParts } : MappedTextProps) => {
  const children = splitParts.map((part, i) => {

    if (typeof part == 'object' && 'code' in part) {
        return <CodeInTextView inline>{ part.code }</CodeInTextView>
    }
    else if (typeof part == 'string') {
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
      marginBottom : '5px'
    } : {
      marginTop : '150px'
    })
  }

  return <Typography { ...props } />
}