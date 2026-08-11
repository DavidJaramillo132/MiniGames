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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-[620px] rounded-[30px] border border-[rgba(120,230,255,0.18)] bg-[linear-gradient(180deg,rgba(9,20,37,0.98),rgba(4,10,20,0.98))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm uppercase tracking-[0.16em] text-[#95defe]/45">{t('createRoom')}</div>
            <h2 className="mt-2 text-[2rem] leading-none font-bold tracking-[-0.04em] text-[#f5f7ff]">
              {t('newRoom', { game: gameName ?? '' })}
            </h2>
          </div>
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
