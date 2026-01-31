import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material"

interface Props  {
    onClose : () => void
    onDelete : () => void
    title : string
    content : string
}

export default ({ onClose, onDelete, title, content } : Props) => {


    return (
      <Dialog open onClose={onClose}>
        <DialogTitle>{ title }</DialogTitle>
        <DialogContent>
          <Typography>{ content }</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onDelete} color="error">
            Удалить
          </Button>
          <Button onClick={onClose} color="primary" autoFocus>
            Отменить
          </Button>
        </DialogActions>
      </Dialog>
    )
}