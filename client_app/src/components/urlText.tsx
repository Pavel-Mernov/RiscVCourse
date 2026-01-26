import { Typography } from "@mui/material";
import Link from "@mui/material/Link";

type Props = {
    children : string
}

const urlRegex = /(https?:\/\/[^\s]+)/g;

export default ({ children } : Props) => {
  const paragraphs = children.split('\n');

  return (
    <>
      {paragraphs.map((para, idx) => {
        const parts = para.split(urlRegex);

        return (
          <Typography 
            key={idx} 
            style={{ whiteSpace : 'pre-line' }}
            variant='body1'
            marginTop='150px'
            fontSize='24px'
            textAlign='justify'
            >
            
            {parts.map((part, i) => {
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
            })}
          </Typography>
        );
      })}
    </>
  );
};