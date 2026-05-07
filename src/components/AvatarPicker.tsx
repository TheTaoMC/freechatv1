'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

export const AVATAR_OPTIONS = {
  top: [
    'noHair', 'eyepatch', 'hat', 'hijab', 'turban', 'winterHat1', 'winterHat2', 'winterHat3', 'winterHat4',
    'longHairBigHair', 'longHairBob', 'longHairBun', 'longHairCurly', 'longHairCurvy', 'longHairDreads',
    'longHairFrida', 'longHairFro', 'longHairFroBand', 'longHairNotTooLong', 'longHairShavedSides',
    'longHairMiaWallace', 'longHairStraight', 'longHairStraight2', 'longHairStraightStrand',
    'shortHairDreads01', 'shortHairDreads02', 'shortHairFrizzle', 'shortHairShaggyMullet',
    'shortHairShortCurly', 'shortHairShortFlat', 'shortHairShortRound', 'shortHairShortWaved',
    'shortHairSides', 'shortHairTheCaesar', 'shortHairTheCaesarSidePart'
  ],
  accessories: ['blank', 'kurt', 'prescription01', 'prescription02', 'round', 'sunglasses', 'wayfarers'],
  hairColor: ['2c1b18', '472422', 'b58143', '724130', '4a312c', 'f59797', 'ecdcbf', 'c93305', 'e8e1e1'], // Hex colors for hair in v9
  facialHair: ['blank', 'beardMedium', 'beardLight', 'beardMajestic', 'moustacheFancy', 'moustacheMagnum'],
  clothing: ['blazerShirt', 'blazerSweater', 'collarSweater', 'graphicShirt', 'hoodie', 'overall', 'shirtVNeck'],
  eyes: ['default', 'closed', 'cry', 'dizzy', 'eyeRoll', 'happy', 'hearts', 'side', 'squint', 'surprised', 'wink', 'winkWacky'],
  eyebrows: ['default', 'angry', 'angryNatural', 'defaultNatural', 'flatNatural', 'raisedExcited', 'raisedExcitedNatural', 'sadConcerned', 'unibrowNatural', 'upDown', 'upDownNatural'],
  mouth: ['default', 'concerned', 'disbelief', 'eating', 'grimace', 'sad', 'screamOpen', 'serious', 'smile', 'tongue', 'twinkle', 'vomit'],
  skin: ['tanned', 'yellow', 'pale', 'light', 'brown', 'darkBrown', 'black']
}

type AvatarConfig = {
  top: string
  accessories: string
  hairColor: string
  facialHair: string
  clothing: string
  eyes: string
  eyebrows: string
  mouth: string
  skin: string
}

interface AvatarPickerProps {
  config: AvatarConfig
  onChange: (newConfig: AvatarConfig) => void
}

export default function AvatarPicker({ config, onChange }: AvatarPickerProps) {
  const updateConfig = (key: keyof AvatarConfig, direction: number) => {
    const options = AVATAR_OPTIONS[key]
    const currentIndex = options.indexOf(config[key])
    let nextIndex = (currentIndex + direction) % options.length
    if (nextIndex < 0) nextIndex = options.length - 1
    
    onChange({
      ...config,
      [key]: options[nextIndex]
    })
  }

  const OptionRow = ({ label, attr }: { label: string, attr: keyof AvatarConfig }) => (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => updateConfig(attr, -1)}
          className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-bold min-w-[100px] text-center truncate">{config[attr]}</span>
        <button 
          onClick={() => updateConfig(attr, 1)}
          className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4 text-accent">
        <Sparkles size={16} />
        <span className="text-sm font-bold uppercase">Customize Your Look</span>
      </div>
      
      <div className="bg-white/5 rounded-2xl p-4 space-y-1">
        <OptionRow label="Hair / Hat" attr="top" />
        <OptionRow label="Hair Color" attr="hairColor" />
        <OptionRow label="Eyes" attr="eyes" />
        <OptionRow label="Eyebrows" attr="eyebrows" />
        <OptionRow label="Mouth" attr="mouth" />
        <OptionRow label="Accessories" attr="accessories" />
        <OptionRow label="Facial Hair" attr="facialHair" />
        <OptionRow label="Clothing" attr="clothing" />
        <OptionRow label="Skin Tone" attr="skin" />
      </div>
    </div>
  )
}

export function getAvatarUrl(config: any) {
  const seed = config?.seed || 'custom'
  const params = new URLSearchParams()
  
  if (config) {
    Object.entries(config).forEach(([key, value]) => {
      if (key === 'seed') return
      
      // Mapping to DiceBear v9 parameter names
      let paramKey = key
      if (key === 'skin') paramKey = 'skinColor'
      if (key === 'hairColor') paramKey = 'hairColor'
      
      // Ensure color values are passed correctly (DiceBear v9 uses arrays or strings)
      params.append(paramKey, value as string)
    })
  }
  
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&${params.toString()}`
}


