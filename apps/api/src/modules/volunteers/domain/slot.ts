import { type NewRegistration, Registration } from './registration';
import { slotFull, volunteerAlreadyRegistered } from './volunteers.errors';

export interface SlotProps {
  id: string;
  capacity: number;
  registrations: Registration[];
}

/** Un créneau de bénévolat : une capacité et ses inscriptions. */
export class Slot {
  private constructor(private readonly props: SlotProps) {}

  static restore(props: SlotProps): Slot {
    return new Slot({ ...props, registrations: [...props.registrations] });
  }

  get id(): string {
    return this.props.id;
  }
  get capacity(): number {
    return this.props.capacity;
  }
  get registrations(): readonly Registration[] {
    return this.props.registrations;
  }
  get placesLeft(): number {
    return this.props.capacity - this.props.registrations.length;
  }

  register(input: Omit<NewRegistration, 'slotId'>): Registration {
    const registration = Registration.create({ ...input, slotId: this.id });
    if (this.props.registrations.some((r) => r.email === registration.email)) {
      throw volunteerAlreadyRegistered(this.id);
    }
    if (this.placesLeft <= 0) {
      throw slotFull(this.id);
    }
    this.props.registrations.push(registration);
    return registration;
  }
}
