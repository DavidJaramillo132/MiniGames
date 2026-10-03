import Button from '../ui/Button';
import Input from '../ui/Input';
import { useI18n } from '../../i18n/LanguageContext';

interface CreateRoomModalProps {
  gameName?: string;
  isOpen: boolean;
  roomName: string;
  onRoomNameChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

function CreateRoomModal({
  gameName,
  isOpen,
  roomName,
  onRoomNameChange,
  onClose,
  onConfirm,
}: CreateRoomModalProps) {
  const { t } = useI18n();
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-[560px] rounded-[22px] border border-white/[0.08] bg-[#111114]/98 p-6 sm:p-7 shadow-[0_24px_80px_rgba(0,0,0,0.85)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-['Rajdhani'] text-[2.2rem] font-bold uppercase tracking-[0.04em] text-[#f4f4f6]">
            {t('newRoom', { game: gameName ?? '' })}
          </h2>
          <Button variant="ghost" onClick={onClose}>
            {t('close')}
          </Button>
        </div>
       
        <div className="mt-6">
          <Input
            label={t('roomName')}
            placeholder={t('roomNamePlaceholder')}
            value={roomName}
            onChange={onRoomNameChange}
            helpText={t('roomNameHelp')}
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="surface" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button onClick={onConfirm} disabled={!roomName.trim()}>
            {t('confirmRoom')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CreateRoomModal;
