import re,glob,sys
A='/home/claude/npm/node_modules/@phosphor-icons/core/assets/'
M={'search':('magnifying-glass','bold'),'x':('x','bold'),'cart':('shopping-cart-simple','duotone'),'heart':('heart','duotone'),'user':('user-circle','duotone'),
'box':('package','duotone'),'pin':('map-pin','duotone'),'globe':('globe-hemisphere-east','duotone'),'chevron-down':('caret-down','bold'),'chevron-right':('caret-right','bold'),
'chevron-left':('caret-left','bold'),'star':('star','fill'),'plus':('plus','bold'),'minus':('minus','bold'),'truck':('truck','duotone'),'shield':('shield-check','duotone'),
'return':('arrow-u-up-left','duotone'),'lock':('lock-simple','duotone'),'check':('check','bold'),'filter':('sliders-horizontal','duotone'),'home':('house','duotone'),
'grid':('squares-four','duotone'),'pause':('pause','fill'),'play':('play','fill'),'phone':('phone','duotone'),'mail':('envelope-simple','duotone'),'chat':('chat-circle-dots','duotone'),
'bolt':('lightning','fill'),'tag':('tag','duotone'),'trash':('trash','duotone'),'sparkle':('sparkle','duotone'),'arrow-up':('arrow-up','bold'),'store':('storefront','duotone'),
'card':('credit-card','duotone'),'wallet':('wallet','duotone'),'info':('info','duotone'),'clock':('clock','duotone'),'menu':('list','bold'),'logout':('sign-out','duotone'),'gift':('gift','duotone'),
'p-phone':('device-mobile','duotone'),'p-laptop':('laptop','duotone'),'p-headphones':('headphones','duotone'),'p-watch':('watch','duotone'),'p-shirt':('t-shirt','duotone'),
'p-shoe':('sneaker','duotone'),'p-bottle':('drop','duotone'),'p-sofa':('couch','duotone'),'p-toy':('puzzle-piece','duotone'),'p-book':('book-open-text','duotone'),
'p-ball':('soccer-ball','duotone'),'p-car':('car','duotone'),'p-baby':('baby-carriage','duotone'),'p-pan':('cooking-pot','duotone'),'p-tv':('television-simple','duotone'),
'p-camera':('camera','duotone'),'p-milk':('basket','duotone'),'p-perfume':('spray-bottle','duotone')}
syms=[]
for k,(n,w) in M.items():
    f=A+w+'/'+n+('' if w=='regular' else '-'+w)+'.svg'; s=open(f).read()
    inner=re.search(r'<svg[^>]*>(.*)</svg>',s,re.S).group(1)
    syms.append(f'<symbol id="i-{k}" viewBox="0 0 256 256" fill="currentColor">{inner}</symbol>')
sprite='<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">\n'+'\n'.join(syms)+'\n</svg>'
for h in glob.glob('*.html'):
    t=open(h).read()
    t2,n=re.subn(r'<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">.*?</svg>\n</svg>|<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">(?:\s*<symbol.*?</symbol>)+\s*</svg>',lambda m:sprite,t,count=1,flags=re.S)
    print(h,n); open(h,'w').write(t2)
