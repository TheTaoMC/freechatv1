'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

export const AVATAR_OPTIONS = {
  top: [
    'NoHair', 'Eyepatch', 'Hat', 'Hijab', 'Turban', 'WinterHat1', 'WinterHat2', 'WinterHat3', 'WinterHat4',
    'LongHairBigHair', 'LongHairBob', 'LongHairBun', 'LongHairCurly', 'LongHairCurvy', 'LongHairDreads',
    'LongHairFrida', 'LongHairFro', 'LongHairFroBand', 'LongHairNotTooLong', 'LongHairShavedSides',
    'LongHairMiaWallace', 'LongHairStraight', 'LongHairStraight2', 'LongHairStraightStrand',
    'ShortHairDreads01', 'ShortHairDreads02', 'ShortHairFrizzle', 'ShortHairShaggyMullet',
    'ShortHairShortCurly', 'ShortHairShortFlat', 'ShortHairShortRound', 'ShortHairShortWaved',
    'ShortHairSides', 'ShortHairTheCaesar', 'ShortHairTheCaesarSidePart'
  ],
  accessories: ['Blank', 'Kurt', 'Prescription01', 'Prescription02', 'Round', 'Sunglasses', 'Wayfarers'],
  hairColor: ['Black', 'Blonde', 'BlondeGolden', 'Brown', 'BrownDark', 'PastelPink', 'Platinum', 'Red', 'SilverGray'],
  facialHair: ['Blank', 'BeardMedium', 'BeardLight', 'BeardMajestic', 'MoustacheFancy', 'MoustacheMagnum'],
  clothing: ['BlazerShirt', 'BlazerSweater', 'CollarSweater', 'GraphicShirt', 'Hoodie', 'Overall', 'ShirtVNeck'],
  eyes: ['Default', 'Close', 'Cry', 'Dizzy', 'EyeRoll', 'Happy', 'Hearts', 'Side', 'Squint', 'Surprised', 'Wink', 'WinkWacky'],
  eyebrows: ['Default', 'Angry', 'AngryNatural', 'DefaultNatural', 'FlatNatural', 'RaisedExcited', 'RaisedExcitedNatural', 'SadConcerned', 'UnibrowNatural', 'UpDown', 'UpDownNatural'],
  mouth: ['Default', 'Concerned', 'Disbelief', 'Eating', 'Grimace', 'Sad', 'ScreamOpen', 'Serious', 'Smile', 'Tongue', 'Twinkle', 'Vomit'],
  skin: ['Tanned', 'Yellow', 'Pale', 'Light', 'Brown', 'DarkBrown', 'Black']
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
  // Use a fallback seed if config is missing
  const seed = config?.seed || 'default'
  const params = new URLSearchParams()
  
  if (config) {
    Object.entries(config).forEach(([key, value]) => {
      if (key === 'seed') return
      // DiceBear 7.x+ uses skinColor instead of skin
      const paramKey = key === 'skin' ? 'skinColor' : key
      params.append(paramKey, value as string)
    })
  }
  
  // Use DiceBear 9.x for latest features and better stability
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&${params.toString()}`
}

