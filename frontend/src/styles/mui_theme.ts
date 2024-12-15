import { createTheme } from "@mui/material";

const defaultTheme = createTheme()
export const Theme = createTheme({
    palette: {
        blue: defaultTheme.palette.augmentColor({
            color: {
                main: "#064ACB"
            },
            name: "blue"
        }), 
        orange: defaultTheme.palette.augmentColor({
            color: {
                main: "#F3A953"
            }
        }),
        midBlue: defaultTheme.palette.augmentColor({
            color: {
                main: "#366ED8"
            }
        }),
        offWhite: defaultTheme.palette.augmentColor({
            color: {
                main: "#F2F3F3"
            }
        }),
    },
});


// Augment the palette to include this palette
declare module '@mui/material/styles' {
    interface Palette {
        blue?: Palette["primary"];
        orange: Palette["primary"];
        midBlue: Palette["primary"];
        offWhite: Palette["primary"];
    }
    interface PaletteOptions {
        blue?: PaletteOptions["primary"];
        orange: PaletteOptions["primary"];
        midBlue: PaletteOptions["primary"];
        offWhite: PaletteOptions["primary"];
    }
}

// Update the Button's color options to include these options
declare module '@mui/material/Button' {
    interface ButtonPropsColorOverrides {
        blue: true, 
        orange: true,
        midBlue: true,
        offWhite: true,
    }
  }

  declare module '@mui/material/Typography' {
    interface TypographyPropsColorOverrides {
        blue: true, 
        orange: true,
        midBlue: true,
        offWhite: true,
    }
  }

