import sys,glob,os
from PIL import Image, ImageDraw
d=sys.argv[1]; out=sys.argv[2]; cols=int(sys.argv[3]) if len(sys.argv)>3 else 4
fs=sorted(glob.glob(d+'/f*.jpg')); w,h=270,480
rows=(len(fs)+cols-1)//cols; S=Image.new('RGB',(cols*w,rows*(h+24)),'white'); D=ImageDraw.Draw(S)
for i,f in enumerate(fs):
    im=Image.open(f).resize((w,h)); x=(i%cols)*w; y=(i//cols)*(h+24); S.paste(im,(x,y+24)); D.text((x+6,y+5),os.path.basename(f)[1:5],fill='black')
S.save(out,quality=88)
