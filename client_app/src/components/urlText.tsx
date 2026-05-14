import { Typography } from "@mui/material";
import { parseText } from "../textParser/parseText";
import MappedText from "./MappedText";
import CodeInTextView from "./CodeInTextView";

type Props = {
    children : string
}

const urlRegex = /(https?:\/\/[^\s]+)/g;

export default ({ children } : Props) => {
  const paragraphs = parseText(children);

  

  return (
    <>
      { paragraphs.map((para, idx) => {
        if (typeof para == 'string') {
          const parts = para.split(urlRegex);

          return <MappedText key={ idx } splitParts={ parts } />
        }
        else if ('code' in para) {
          return <CodeInTextView key={ idx }>{ para.code }</CodeInTextView>
        }
        else if ('ul' in para) {

          console.log('before', para.ul)

          const parts = para.ul.map(li => 
            typeof li === 'string' 
            ? 
            li.split(urlRegex) 
            :
            Array.isArray(li) ?
            li.map(part => typeof part === 'string' ? part.split(urlRegex) : part)
            .flat()
            :
            li 
          );

          console.log('after', parts)

          return (
            <Typography
              component='ul'
              key={ idx }
              marginTop='100px'
              
              textAlign='justify'
            >
              {
                parts.map((part, i) => (
                  ('code' in part) ? 
                  <CodeInTextView key={ i } inline>{ part.code }</CodeInTextView>
                  :
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