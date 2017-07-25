import * as Types from "./SharedTypes"

export class HouseMember 
{
    firstName        : string;
    lastName         : string;
    representativeId : string;
    govtrackId       : string;
    cspanId          : string;
    votesmartId      : string;
    googleEntityId   : string;
    url              : string;
    contactUrl       : string;
    state            : string;
    district         : number;
    apiUrl           : string;
    twitterAccount   : string;
    facebookAccount  : string;
    phone            : string;
    party            : Types.Party;
    chamber          : Types.Chamber;

    constructor()
    {
        this.chamber = Types.Chamber.House
    }

    SetRepresentativeId(repId : string)
    {
        this.representativeId = repId;
    }
}