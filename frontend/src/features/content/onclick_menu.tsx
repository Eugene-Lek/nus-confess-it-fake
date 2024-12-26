import { Button, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper } from "@mui/material"
import { FC, MouseEvent, SyntheticEvent, useEffect, useRef, useState } from "react"
import MenuIcon from '@mui/icons-material/Menu';

export interface menuOption {
    label: string,
    onClick: any,
}

interface props{
    options: menuOption[]
}

export const OnClickMenu: FC<props> = ({options}) => {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<SVGSVGElement>(null);
  
    const handleToggle = (e: MouseEvent<SVGSVGElement>) => {
      e.stopPropagation()
      setOpen((prevOpen) => !prevOpen);
    };
  
    const handleClose = (event: Event | SyntheticEvent) => {
      if (
        anchorRef.current &&
        anchorRef.current.contains(event.target as HTMLElement)
      ) {
        return;
      }
  
      setOpen(false);
    };

    const handleClickOption = (e: MouseEvent<HTMLLIElement>, optionOnClick: any) => {
      e.stopPropagation()
      optionOnClick()
    }
  
    // return focus to the button when we transitioned from !open -> open
    const prevOpen = useRef(open);
    useEffect(() => {
      if (prevOpen.current === true && open === false) {
        anchorRef.current!.focus();
      }
  
      prevOpen.current = open;
    }, [open]);

    return (
        <>
            <MenuIcon
                component="svg"
                ref={anchorRef}
                id="menu-icon"
                aria-controls={open ? 'menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup="true"
                onClick={handleToggle}            
            />
            <Popper
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            placement="bottom-start"
            transition
            disablePortal
            >
            {({ TransitionProps, placement }) => (
                <Grow
                {...TransitionProps}
                style={{
                    transformOrigin:
                    placement === 'bottom-start' ? 'left top' : 'left bottom',
                }}
                >
                <Paper>
                    <ClickAwayListener onClickAway={handleClose}>
                    <MenuList
                        autoFocusItem={open}
                        id="menu"
                        aria-labelledby="menu-icon"
                    >
                        {options.map((option) => <MenuItem key={option.label} onClick={(e) => handleClickOption(e, option.onClick)}>{option.label}</MenuItem>)}
                    </MenuList>
                    </ClickAwayListener>
                </Paper>
                </Grow>
            )}
            </Popper>        
        </>        
    )    
}