// data/reportStructure.ts

export interface Field {
  id: string;
  type: string;
  label: string;
  order: number;
  result: string;
  isCalculated?: boolean;
  calculationRule?: string;
  children?: Field[];
}

export interface Section {
  id: string;
  title: string;
  fields: Field[];
  columns?: any[];
}

export interface ReportData {
  sections: Section[];
}

export const reportStructure: ReportData = {
  sections: [
    {
      id: "A",
      title: "А. Нийтлэг хувь хэмжээгээр ногдуулах татварын тооцоолол",
      fields: [
        {
          id: "1",
          type: "number",
          label: "1. Нийт орлогын дүн (мөр 2+3+4+5)",
          order: 1,
          result: "0.00",
          isCalculated: true,
          calculationRule: "2+3+4+5",
          children: [
            {
              id: "2",
              type: "number",
              label: "1.1. Татвараас чөлөөлөгдөх орлогын дүн",
              order: 2,
              result: "0.00",
              isCalculated: false,
            },
            {
              id: "3",
              type: "number",
              label: "1.2. Тусгай хувь хэмжээгээр татвар ногдох орлого (32)",
              order: 3,
              result: "0.00",
              isCalculated: false,
            },
            {
              id: "4",
              type: "number",
              label: "1.3. Бусад орлогын дүн",
              order: 4,
              result: "0.00",
              isCalculated: false,
            },
            {
              id: "5",
              type: "number",
              label: "1.4. Нийтлэг хувь хэмжээгээр татвар ногдох орлого",
              order: 5,
              result: "0.00",
              isCalculated: true,
              calculationRule: "6+7+8+9+10+11+12+13+14+15+16",
              children: [
                { id: "6", type: "number", label: "Бараа, ажил, үйлчилгээний борлуулалтын орлого", order: 6, result: "0.00", isCalculated: false },
                { id: "7", type: "number", label: "Техникийн, удирдлагын, зөвлөхийн болон бусад үйлчилгээний орлого", order: 7, result: "0.00", isCalculated: false },
                { id: "8", type: "number", label: "Үл хөдлөх эд хөрөнгө ашиглуулсан болон түрээслүүлсний орлого", order: 8, result: "0.00", isCalculated: false },
                { id: "9", type: "number", label: "Хөдлөх эд хөрөнгө ашиглуулсан болон түрээслүүлсний орлого", order: 9, result: "0.00", isCalculated: false },
                { id: "10", type: "number", label: "Үнэ төлбөргүйгээр бусдаас авсан бараа, ажил, үйлчилгээний орлого", order: 10, result: "0.00", isCalculated: false },
                { id: "11", type: "number", label: "Гэрээгээр хүлээсэн үүргээ биелүүлээгүй этгээдээс авсан хүү, анз", order: 11, result: "0.00", isCalculated: false },
                { id: "12", type: "number", label: "Төлбөрт таавар, бооцоот тоглоом, эд мөнгөний хонжворт сугалааны орлого", order: 12, result: "0.00", isCalculated: false },
                { id: "13", type: "number", label: "Хувьцаа, үнэт цаас, санхүүгийн бусад хэрэгсэл борлуулсны орлого", order: 13, result: "0.00", isCalculated: false },
                { id: "14", type: "number", label: "Бусад биет бус хөрөнгө болон хөдлөх эд хөрөнгө борлуулсан, шилжүүлсний орлого", order: 14, result: "0.00", isCalculated: false },
                { id: "15", type: "number", label: "Гадаад валютын ханшийн зөрүүгийн бодит орлого", order: 15, result: "0.00", isCalculated: false },
                { id: "16", type: "number", label: "Албан татвар ногдох бусад орлого", order: 16, result: "0.00", isCalculated: false },
              ],
            },
          ],
        },
        {
          id: "17",
          type: "number",
          label: "2. Нийт зардлын дүн (18+19+20)",
          order: 17,
          result: "0.00",
          isCalculated: true,
          calculationRule: "18+19+20",
          children: [
            { id: "18", type: "number", label: "2.1. Борлуулсан бүтээгдэхүүний өртөг", order: 18, result: "0.00", isCalculated: false },
            { id: "19", type: "number", label: "2.2. Удирдлагын болон борлуулалтын үйл ажиллагааны зардал", order: 19, result: "0.00", isCalculated: false },
            { id: "20", type: "number", label: "2.3. Үндсэн бус үйл ажиллагааны зардал", order: 20, result: "0.00", isCalculated: false },
          ],
        },
        { id: "21", type: "number", label: "3. Татвар төлөхийн өмнөх ашиг +, алдагдал - (1-17)", order: 21, result: "0.00", isCalculated: true, calculationRule: "1-17" },
        { id: "22", type: "number", label: "4. Татвар төлөхийн өмнөх ашиг, алдагдлыг нэмэгдүүлэх дүн", order: 22, result: "0.00", isCalculated: false },
        { id: "23", type: "number", label: "5. Татвар төлөхийн өмнөх ашиг, алдагдлыг бууруулах дүн", order: 23, result: "0.00", isCalculated: false },
        { id: "24", type: "number", label: "6. Татвар ногдуулах орлого (21+22-23)", order: 24, result: "0.00", isCalculated: true, calculationRule: "21+22-23" },
        { id: "25", type: "number", label: "7. Сайн дурын даатгалын хураамжийн хэтрэлт", order: 25, result: "0.00", isCalculated: false },
        { id: "26", type: "number", label: "8. Зохицуулагдсан татвар ногдуулах орлогын дүн (24+25)", order: 26, result: "0.00", isCalculated: true, calculationRule: "24+25" },
        { id: "27", type: "number", label: "9. Өмнөх жилүүдийн татварын тайлангаар гарсан татварын албаар баталгаажуулсан алдагдлаас тайлант хугацаанд шилжүүлсэн дүн", order: 27, result: "0.00", isCalculated: false },
        { id: "28", type: "number", label: "10. Нийтлэг хувь хэмжээгээр татвар ногдуулах орлого (26-27)", order: 28, result: "0.00", isCalculated: true, calculationRule: "26-27" },
        { id: "29", type: "number", label: "11. Ногдуулсан төлбөл зохих албан татвар (28 * 25%)", order: 29, result: "0.00", isCalculated: false },
        { id: "30", type: "number", label: "12. Хуулийн 22.5, 22.9-д заасны дагуу хөнгөлөгдөх татвар", order: 30, result: "0.00", isCalculated: false },
        { id: "31", type: "number", label: "13. НИЙТЛЭГ ХУВЬ ХЭМЖЭЭГЭЭР НОГДУУЛСАН ТӨЛБӨЛ ЗОХИХ АЛБАН ТАТВАР (29-30)", order: 31, result: "0.00", isCalculated: true, calculationRule: "29-30" },
      ],
    },
    {
      id: "Б",
      title: "Б. Тусгай хувь хэмжээгээр ногдуулах татварын тооцоолол:",
      fields: [
        { id: "32", type: "number", label: "14.Тусгай хувь хэмжээгээр татвар ногдох орлого (33+38+39+40+41+42+44+45+47+49)", order: 32, result: "0.00", isCalculated: true, calculationRule: "33+38+39+40+41+42+44+45+47+49" },
        {
          id: "33",
          type: "number",
          label: "15. Төрийн байгууллагаас олгосон эрх борлуулсан, шилжүүлсний орлого",
          order: 33,
          result: "0.00",
          isCalculated: false,
          children: [
            { id: "34", type: "number", label: "Төрийн байгууллагад төлсөн төлбөр", order: 34, result: "0.00", isCalculated: false },
            { id: "35", type: "number", label: "Бусдаас худалдаж авахад төлсөн төлбөр", order: 35, result: "0.00", isCalculated: false },
            { id: "36", type: "number", label: "Татвар ногдуулах орлого (33-34-35)", order: 36, result: "0.00", isCalculated: true, calculationRule: "33-34-35" },
            { id: "37", type: "number", label: "Ногдуулсан татвар (36 * 10%)", order: 37, result: "0.00", isCalculated: true, calculationRule: "36 * 10%" },
          ],
        },
        { id: "38", type: "number", label: "16. Эрхийн шимтгэлийн орлого", order: 38, result: "0.00", isCalculated: false },
        { id: "39", type: "number", label: "17. Ногдол ашгийн орлого", order: 39, result: "0.00", isCalculated: false },
        { id: "40", type: "number", label: "18. Буцаан олгосон мөнгөн хөрөнгө", order: 40, result: "0.00", isCalculated: false },
        { id: "41", type: "number", label: "19. Даатгалын нөхөн төлбөрийн орлого", order: 41, result: "0.00", isCalculated: false },
        {
          id: "42",
          type: "number",
          label: "20. Хүүгийн орлого",
          order: 42,
          result: "0.00",
          isCalculated: false,
          children: [
            { id: "43", type: "number", label: "Ногдуулсан татвар ((38+39+40+41+42) * 10%)", order: 43, result: "0.00", isCalculated: true, calculationRule: "(38+39+40+41+42) * 0.10" },
          ],
        },
        { id: "44", type: "number", label: "21. Зээл, өрийн хэрэгслийн хүүгийн орлого", order: 44, result: "0.00", isCalculated: false },
        {
          id: "45",
          type: "number",
          label: "22. Үнэт цаасны хүүгийн орлого",
          order: 45,
          result: "0.00",
          isCalculated: false,
          children: [
            { id: "46", type: "number", label: "Ногдуулсан татвар ((44+45) * 5%)", order: 46, result: "0.00", isCalculated: true, calculationRule: "(44+45) * 0.05" },
          ],
        },
        {
          id: "47",
          type: "number",
          label: "23. Үл хөдлөх эд хөрөнгө борлуулсан, шилжүүлсний орлого",
          order: 47,
          result: "0.00",
          isCalculated: false,
          children: [
            { id: "48", type: "number", label: "Ногдуулсан татвар (47 * 2%)", order: 48, result: "0.00", isCalculated: true, calculationRule: "47 * 0.02" },
          ],
        },
        {
          id: "49",
          type: "number",
          label: "24. Төлбөрт таавар, бооцоот тоглоом, сугалаанаас хожсон орлого",
          order: 49,
          result: "0.00",
          isCalculated: false,
          children: [
            { id: "50", type: "number", label: "Ногдуулсан татвар (49 * 40%)", order: 50, result: "0.00", isCalculated: true, calculationRule: "49 * 0.40" },
          ],
        },
        { id: "51", type: "number", label: "25. ТУСГАЙ ХУВЬ ХЭМЖЭЭГЭЭР НОГДУУЛСАН АЛБАН ТАТВАР (37+43+46+48+50)", order: 51, result: "0.00", isCalculated: true, calculationRule: "37+43+46+48+50" },
      ],
    },
    {
      id: "В",
      title: "В. Албан татвар ногдуулах тооцоолол",
      fields: [
        { id: "52", type: "number", label: "26. Хуулийн дагуу бусдад суутгуулсан албан татвар", order: 52, result: "0.00", isCalculated: false },
        { id: "53", type: "number", label: "27. Гадаад улсад ногдуулан төлсөн албан татвар", order: 53, result: "0.00", isCalculated: false },
        { id: "54", type: "number", label: "28. ТӨЛБӨЛ ЗОХИХ ТАТВАРЫН ДҮН (31+51-52-53)", order: 54, result: "0.00", isCalculated: true, calculationRule: "31+51-52-53" },
        { id: "55", type: "number", label: "29. Хөнгөлөн буцаан авахаар тооцсон дүн", order: 55, result: "0.00", isCalculated: false },
      ],
    },
    {
      id: "Г",
      title: "Г. Аж ахуйн нэгжийн орлогын албан татвараас хөнгөлөх, чөлөөлөх тухай хуулийн дагуу албан татвараас хөнгөлөх, чөлөөлөх татварын тооцоолол",
      fields: [
        { id: "56", type: "number", label: "30. Түрээсийн төлбөрийг бууруулсан аж ахуйн нэгжийг орлогын албан татвараас хөнгөлөх", order: 56, result: "0.00", isCalculated: false },
        { id: "57", type: "number", label: "31. Аж ахуйн нэгжийн орлогын албан татвараас чөлөөлөх мэдээ", order: 57, result: "0.00", isCalculated: false },
        { id: "58", type: "number", label: "32. Нийт төлбөл зохих татварын дүн (31+51-52-53-56-57)", order: 58, result: "0.00", isCalculated: true, calculationRule: "31+51-52-53-56-57" },
      ],
    },
  ],
};

// Бүх талбарын ID-уудын жагсаалт
export const ALL_FIELD_IDS = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16",
  "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31",
  "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46",
  "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58"
];

// Форматлах функцууд
export const formatAsMoney = (value: string | number): string => {
  if (value === "" || value === undefined || value === null) return "0.00 ₮";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0.00 ₮";
  const formatted = num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${formatted} ₮`;
};

export const parseInputValue = (value: string): string => {
  if (!value) return "";
  let cleanValue = value.replace(/,/g, "");
  cleanValue = cleanValue.replace(/[^0-9.-]/g, "");
  const dotCount = (cleanValue.match(/\./g) || []).length;
  if (dotCount > 1) {
    const firstDotIndex = cleanValue.indexOf(".");
    cleanValue =
      cleanValue.substring(0, firstDotIndex + 1) +
      cleanValue.substring(firstDotIndex + 1).replace(/\./g, "");
  }
  const num = parseFloat(cleanValue);
  if (isNaN(num)) return "";
  return num.toString();
};


// Тооцооллын дүрмүүд
export const getCalculationRules = () => ({
  "1": (getValue: (id: string) => number) => getValue("2") + getValue("3") + getValue("4") + getValue("5"),
  "5": (getValue: (id: string) => number) => getValue("6") + getValue("7") + getValue("8") + getValue("9") + getValue("10") + 
        getValue("11") + getValue("12") + getValue("13") + getValue("14") + getValue("15") + getValue("16"),
  "17": (getValue: (id: string) => number) => getValue("18") + getValue("19") + getValue("20"),
  "21": (getValue: (id: string) => number) => getValue("1") - getValue("17"),
  "24": (getValue: (id: string) => number) => getValue("21") + getValue("22") - getValue("23"),
  "26": (getValue: (id: string) => number) => getValue("24") + getValue("25"),
  "28": (getValue: (id: string) => number) => getValue("26") - getValue("27"),
  "29": (getValue: (id: string) => number) => getValue("28") * 0.25,
  "31": (getValue: (id: string) => number) => getValue("29") - getValue("30"),
  "32": (getValue: (id: string) => number) => getValue("33") + getValue("38") + getValue("39") + getValue("40") + getValue("41") + 
          getValue("42") + getValue("44") + getValue("45") + getValue("47") + getValue("49"),
  "36": (getValue: (id: string) => number) => getValue("33") - getValue("34") - getValue("35"),
  "37": (getValue: (id: string) => number) => getValue("36") * 0.10,
  "43": (getValue: (id: string) => number) => (getValue("38") + getValue("39") + getValue("40") + getValue("41") + getValue("42")) * 0.10,
  "46": (getValue: (id: string) => number) => (getValue("44") + getValue("45")) * 0.05,
  "48": (getValue: (id: string) => number) => getValue("47") * 0.02,
  "50": (getValue: (id: string) => number) => getValue("49") * 0.40,
  "51": (getValue: (id: string) => number) => getValue("37") + getValue("43") + getValue("46") + getValue("48") + getValue("50"),
  "54": (getValue: (id: string) => number) => getValue("31") + getValue("51") - getValue("52") - getValue("53"),
  "58": (getValue: (id: string) => number) => getValue("31") + getValue("51") - getValue("52") - getValue("53") - getValue("56") - getValue("57"),
});