import json
phr=["Britain and America almost went to war.","Over a pig.","It's eighteen fifty-nine,","on a tiny island both countries claim.","An American farmer catches a British pig eating his potatoes.","So he shoots it.","The British threaten to arrest him.","The Americans send soldiers.","The British send warships,","with seventy cannons.","All pointed at one potato patch.","But the British admiral refused to fire.","He would not start a war over a pig.","So both armies just stayed.","For twelve years.","They even celebrated holidays together.","Finally,","a German emperor settled it,","without a single shot.","The only casualty?","The pig."]
sil=[(2.4327,2.83279),(3.6122,4.40281),(5.78875,6.28315),(8.35091,9.11179),(12.1044,12.8266),(13.6546,14.3),(16.018,16.6451),(18.3754,18.9902),(20.3512,20.6853),(21.8373,22.6464),(24.3195,25.0244),(26.9167,27.8638),(29.4394,30.2485),(31.7668,32.5773),(33.4407,34.3667),(36.1231,37.0349),(37.5919,38.0443),(39.622,39.9538),(41.1614,41.8184),(42.8676,44.1503),(44.6298,44.8597)]
st=0.03;out=[]
for i,p in enumerate(phr):
    en=sil[i][0]; out.append(dict(i=i,text=p,t0=round(st,3),t1=round(en,3),f0=round(st*30),f1=round(en*30)))
    st=sil[i][1]
json.dump(dict(duration=44.9,frames=1347,phrases=out),open('work/phrases.json','w'),indent=1)
for o in out: print(o['i'],o['f0'],o['f1'],o['text'])
