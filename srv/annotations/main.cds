using {MainService} from '../routes/main';

annotate MainService.SalesOrderHeaders with @(UI: {
    SelectionFields: [
        id,
        totalAmount,
        customer_id,
        status_id, // Alterado para usar o ID local
        createdAt,
        modifiedAt
    ],
    LineItem       : [
        {
            $Type                  : 'UI.DataField',
            Value                  : id,
            @HTML5.CssDefaults     : {Width: '18rem'},
        },
        {
            $Type                  : 'UI.DataField',
            Label                  : 'Cliente',
            Value                  : customer.id, // O Fiori resolverá o texto via anotação do customer
            ![@HTML5.CssDefaults]  : {Width: '18rem'},
        },
        {
            $Type                     : 'UI.DataField',
            Label                     : 'Status',
            // CORREÇÃO: Maiúsculas para bater com o CSV ('COMPLETED')
            Criticality               : (status.id = 'COMPLETED' ? 3 : (status.id = 'PENDING' ? 2 : 1)),
            CriticalityRepresentation : #WithoutIcon,
            // CORREÇÃO: Aponta para o ID da chave estrangeira
            Value                     : status_id, 
            ![@HTML5.CssDefaults]     : {Width: '18rem'},
        },
        {
            $Type                  : 'UI.DataField',
            Value                  : totalAmount,
            ![@HTML5.CssDefaults]  : {Width: '10rem'},
        },
        {
            $Type                  : 'UI.DataField',
            Value                  : createdAt,
            ![@HTML5.CssDefaults]  : {Width: '12rem'},
        },
        {
            $Type                  : 'UI.DataField',
            Value                  : createdBy,
            ![@HTML5.CssDefaults]  : {Width: '12rem'},
        },
    ],
}) {
    id          @title: 'ID';
    totalAmount @title: 'Valor Total';
    
    // CORREÇÃO: Anotações movidas para status_id (onde o valor realmente fica)
    status_id   @(
        title           : 'Status',
        Common          : {
            Label                    : 'Status',
            Text                     : status.description, // Texto vem da associação
            TextArrangement          : #TextOnly,          // Mostra só a descrição
            ValueListWithFixedValues,
            ValueList                : {
                $Type          : 'Common.ValueListType',
                CollectionPath : 'SalesOrderStatuses',
                Parameters     : [{
                    $Type             : 'Common.ValueListParameterInOut',
                    ValueListProperty : 'id',
                    LocalDataProperty : 'status_id'
                }]
            },
        }
    );

    customer    @(
        title           : 'Cliente',
        Common          : {
            Label           : 'Cliente',
            Text            : customer.firstName,
            TextArrangement : #TextOnly,
            ValueList       : {
                $Type          : 'Common.ValueListType',
                CollectionPath : 'Customers',
                Parameters     : [
                    {
                        $Type             : 'Common.ValueListParameterInOut',
                        ValueListProperty : 'id',
                        LocalDataProperty : 'customer_id'
                    },
                    {
                        $Type             : 'Common.ValueListParameterDisplayOnly',
                        ValueListProperty : 'firstName',
                    },
                    {
                        $Type             : 'Common.ValueListParameterDisplayOnly',
                        ValueListProperty : 'lastName',
                    },
                    {
                        $Type             : 'Common.ValueListParameterDisplayOnly',
                        ValueListProperty : 'email',
                    }
                ]
            },
        }
    );
    
    createdAt   @title: 'Data de criação';
    createdBy   @title: 'Criado por';
    modifiedAt  @title: 'Data de atualização';
    modifiedBy  @title: 'Atualizado por';
};

annotate MainService.SalesOrderStatuses with {
    id @Common.Text: description @Common.TextArrangement: #TextOnly
};