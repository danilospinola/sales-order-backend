export type CustomerProps = {
    id: string;
    firstName: string;
    email: string;
    lastName: string;
};

export class CustomerModel {
    constructor(private props: CustomerProps) { }

    public static with(props: CustomerProps): CustomerModel {
        return new CustomerModel(props);
    }


    public get id() {
        return this.props.id;
    }

    public get firstName() {
        return this.props.firstName;
    }

    public get email() {
        return this.props.email;
    }

    public get lastName() {
        return this.props.lastName;
    }

    public setDefaultEmailDomain(): CustomerModel {
        if (this.props.email && !this.props.email.includes('@')) {
            this.props.email = `${this.props.email}@gmail.com`;
        }
        return this;
    }

    public toObject(): CustomerProps {
        return {
            email: this.props.email,
            firstName: this.props.firstName,
            id: this.props.id,
            lastName: this.props.lastName
        };
    }
}
