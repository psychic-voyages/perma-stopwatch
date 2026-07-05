const makeSQLTemplate = (din) => {
    const fields = {};
    fields.keys = Object.keys(din).map(key=>`"${key}"`).join(",");
    fields.temps = Object.keys(din).map((_,idx)=>`$${idx+1}`).join(",");
    fields.values = Object.values(din);
    return fields;
}

export {
    makeSQLTemplate
}