import * as T from './assets/vendor/three.module.js';
import {OBJLoader} from './assets/vendor/OBJLoader.js';
// Original mesh and texture material names: Dragon Busts, Gerhald3D.
export async function loadDragons(renderer){
 const base='./assets/models/dragons/', loader=new T.TextureLoader();
 const texture=async(name,color=false)=>{const t=await loader.loadAsync(base+name+'.png');t.colorSpace=color?T.SRGBColorSpace:T.NoColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;};
 const materials={};
 await Promise.all(['BlackDragon','GreenDragon'].map(async kind=>{
  await Promise.all(['Head','Horns1','Horns2'].map(async part=>{
   const stem=kind+'_'+part;
   const colorSuffix=kind==='GreenDragon'&&part==='Head'?'_BaseColor':'_Base_Color';
   const [map,normalMap,roughnessMap]=await Promise.all([texture(stem+colorSuffix,true),texture(stem+'_Normal'),texture(stem+'_Roughness')]);
   const key=kind+'_'+part.replace(/(Horns)([12])/,'$1_$2');
   materials[key]=new T.MeshStandardMaterial({map,normalMap,roughnessMap,roughness:1,normalScale:new T.Vector2(.8,.8),metalness:0});
  }));
  materials[kind+'_Eyes']=new T.MeshStandardMaterial({map:await texture(kind+'_Eyes',true),roughness:.24,metalness:0});
  materials[kind+'_Teeth']=new T.MeshStandardMaterial({color:0xbab6a0,roughness:.65});
 }));
 const obj=await new OBJLoader().loadAsync(base+'Dragon_Busts_Gerhald3D.obj');
 const groups=[new T.Group(),new T.Group()];
 for(const mesh of [...obj.children]){
  if(!mesh.isMesh)continue;
  const assign=m=>{if(!materials[m.name])throw new Error('Material de dragón desconocido: '+m.name);return materials[m.name];};
  mesh.material=Array.isArray(mesh.material)?mesh.material.map(assign):assign(mesh.material);
  groups[mesh.name.startsWith('BlackDragon')?0:1].add(mesh);
 }
 return groups.map((model,i)=>{const bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3());model.position.sub(bounds.getCenter(new T.Vector3()));const pivot=new T.Group();pivot.add(model);if(i)pivot.rotation.z=1.15;pivot.scale.setScalar(3.6/Math.max(size.x,size.y,size.z));const holder=new T.Group();holder.name=i?'Dragón verde':'Dragón oscuro';holder.add(pivot);return holder;});
}
