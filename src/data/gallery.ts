const GALLERY_PHOTO_COUNT = 20;

export const GALLERY_IMAGES = Array.from({ length: GALLERY_PHOTO_COUNT }, (_, index) => {
  const n = index + 1;
  return {
    src: `/gallery/${n}.jpeg`,
    alt: `Lachava kitchen and pickles — photo ${n}`,
  };
});

export const ABOUT_PORTRAIT = "/bg/herosectionframe.jpeg";

export const FSSAI_LOGO = "/fssai-logo.png";
export const FSSAI_CERTIFICATE = "/fssai-certificate.png";
